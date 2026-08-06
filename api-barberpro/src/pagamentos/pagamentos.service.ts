/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);
  private readonly TIMEOUT_MS = 15000;

  constructor(private prisma: PrismaService) {}

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = this.TIMEOUT_MS,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  async create(createPagamentoDto: CreatePagamentoDto, userPayload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
    const { sub: usuarioId, funcao } = userPayload;

    if (funcao !== 'CLIENTE' && funcao !== 'ADMIN') {
      throw new ForbiddenException('Apenas clientes podem realizar pagamentos');
    }

    const agendamento = await this.prisma.agendamentos.findUnique({
      where: { id: createPagamentoDto.agendamento_id },
      include: {
        clientes: { include: { usuarios: true } },
        servicos: true,
      },
    });

    if (!agendamento) {
      throw new NotFoundException(
        `Agendamento ID ${createPagamentoDto.agendamento_id} não encontrado.`,
      );
    }

    const pagamentoExistente = await this.prisma.pagamentos.findUnique({
      where: { agendamento_id: createPagamentoDto.agendamento_id },
    });

    if (pagamentoExistente) {
      throw new HttpException(
        'Já existe um registro de pagamento para este agendamento.',
        HttpStatus.CONFLICT,
      );
    }

    const usuarioCliente = agendamento.clientes?.usuarios;
    const valorEmCentavos = Math.round(Number(createPagamentoDto.valor) * 100);

    try {
      this.logger.log(
        `Criando cobrança Pix via API direta para o agendamento: ${agendamento.id}`,
      );

      const response = await this.fetchWithTimeout(
        'https://api.abacatepay.com/v2/transparents/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ABACATE_API_KEY}`,
          },
          body: JSON.stringify({
            method: 'PIX',
            data: {
              amount: valorEmCentavos,
              description: agendamento.servicos?.nome || 'Serviço de Barbearia',
              customer: {
                name: usuarioCliente?.nome || 'Cliente',
                email: usuarioCliente?.email || 'cliente@email.com',
                taxId: createPagamentoDto.cpf,
                cellphone: usuarioCliente?.telefone || '(11) 99999-9999',
              },
              metadata: {
                agendamento_id: String(agendamento.id),
              },
            },
          }),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await response.json();

      if (!response.ok) {
        this.logger.error(
          'Erro na resposta da API AbacatePay:',
          JSON.stringify(result),
        );
        throw new HttpException(
          result.error || 'Falha ao processar pagamento na API do AbacatePay.',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log('=== SUCESSO NA REQUISIÇÃO DIRETA ===');

      const novoPagamento = await this.prisma.pagamentos.create({
        data: {
          agendamento_id: agendamento.id,
          metodo: createPagamentoDto.metodo,
          valor: createPagamentoDto.valor,
          status: createPagamentoDto.status || 'Pendente',
          id_transacao: String(result.data.id),
        },
      });

      return {
        pagamentoId: novoPagamento.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        brCode: result.data.brCode,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        brCodeBase64: result.data.brCodeBase64,
        status: novoPagamento.status,
      };
    } catch (error) {
      this.logger.error('Erro na integração:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Erro interno ao processar pagamento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return this.prisma.pagamentos.findMany({ orderBy: { id: 'desc' } });
  }

  async findOne(id: number) {
    const pagamento = await this.prisma.pagamentos.findUnique({
      where: { id },
    });
    if (!pagamento)
      throw new NotFoundException(`Pagamento ID ${id} não encontrado.`);
    return pagamento;
  }

  async update(id: number, updatePagamentoDto: UpdatePagamentoDto) {
    await this.findOne(id);
    return this.prisma.pagamentos.update({
      where: { id },
      data: updatePagamentoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.pagamentos.delete({ where: { id } });
    return { message: `Pagamento ID ${id} removido.` };
  }

  async handleWebhook(
    payload: any,
    rawBody: string,
    signature?: string,
    webhookSecretQuery?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const event = payload?.event;
    if (event !== 'transparent.completed' && event !== 'billing.paid') {
      return { message: 'Evento ignorado' };
    }

    if (
      process.env.ABACATE_WEBHOOK_SECRET &&
      webhookSecretQuery !== process.env.ABACATE_WEBHOOK_SECRET
    ) {
      return { message: 'Webhook secret invalido' };
    }

    const publicKey = process.env.ABACATE_PUBLIC_KEY;
    if (publicKey && signature) {
      const expectedSig = crypto
        .createHmac('sha256', publicKey)
        .update(Buffer.from(rawBody, 'utf8'))
        .digest('base64');

      const bufExpected = Buffer.from(expectedSig);
      const bufReceived = Buffer.from(signature);
      const isValid =
        bufExpected.length === bufReceived.length &&
        crypto.timingSafeEqual(bufExpected, bufReceived);

      if (!isValid) {
        this.logger.warn('Assinatura HMAC invalida');
        return { message: 'Assinatura invalida' };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataObjeto = payload.data || payload;
    const idTransacao = dataObjeto?.id ? String(dataObjeto.id) : null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const agendamentoIdMeta =
      dataObjeto?.metadata?.agendamento_id ||
      dataObjeto?.metadata?.agendamentoId;

    let pagamentoLocal: any = null;

    if (idTransacao) {
      pagamentoLocal = await this.prisma.pagamentos.findFirst({
        where: { id_transacao: idTransacao },
      });
    }

    if (!pagamentoLocal && agendamentoIdMeta) {
      pagamentoLocal = await this.prisma.pagamentos.findFirst({
        where: { agendamento_id: Number(agendamentoIdMeta) },
      });
    }

    if (pagamentoLocal) {
      await this.prisma.pagamentos.update({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { id: pagamentoLocal.id },
        data: {
          status: 'Confirmado',
          pago_em: new Date(),
        },
      });

      if (pagamentoLocal.agendamento_id) {
        try {
          await this.prisma.agendamentos.update({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            where: { id: pagamentoLocal.agendamento_id },
            data: { status: 'CONFIRMADO' },
          });
        } catch (e) {
          this.logger.warn(
            `Erro ao atualizar status do agendamento ${pagamentoLocal.agendamento_id}:`,
            e,
          );
        }
      }
    }

    return { success: true };
  }

  async listarAbacate() {
    const response = await this.fetchWithTimeout(
      'https://api.abacatepay.com/v2/transparents/list',
      {
        headers: { Authorization: `Bearer ${process.env.ABACATE_API_KEY}` },
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await response.json();
    if (!response.ok) {
      throw new HttpException(
        result.error || 'Erro ao listar cobrancas na AbacatePay',
        HttpStatus.BAD_REQUEST,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.data;
  }

  async checkAbacateStatus(pagamentoId: number) {
    const pagamento = await this.findOne(pagamentoId);
    if (!pagamento.id_transacao) {
      throw new BadRequestException('Pagamento sem id_transacao');
    }

    const response = await this.fetchWithTimeout(
      `https://api.abacatepay.com/v2/transparents/check?id=${pagamento.id_transacao}`,
      {
        headers: { Authorization: `Bearer ${process.env.ABACATE_API_KEY}` },
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await response.json();
    if (!response.ok) {
      throw new HttpException(
        result.error || 'Erro ao consultar status na AbacatePay',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (result.data?.status === 'PAID' && pagamento.status !== 'Confirmado') {
      await this.prisma.pagamentos.update({
        where: { id: pagamentoId },
        data: {
          status: 'Confirmado',
          pago_em: new Date(),
        },
      });

      if (pagamento.agendamento_id) {
        try {
          await this.prisma.agendamentos.update({
            where: { id: pagamento.agendamento_id },
            data: { status: 'CONFIRMADO' },
          });
        } catch (e) {
          this.logger.warn(
            `Erro ao atualizar agendamento ${pagamento.agendamento_id}:`,
            e,
          );
        }
      }
    }

    return {
      localId: pagamento.id,
      localStatus: pagamento.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      abacateStatus: result.data?.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      abacateExpiresAt: result.data?.expiresAt,
    };
  }

  async simularPagamento(pagamentoId: number) {
    const pagamento = await this.findOne(pagamentoId);
    if (!pagamento.id_transacao) {
      throw new BadRequestException('Pagamento sem id_transacao');
    }

    const response = await this.fetchWithTimeout(
      `https://api.abacatepay.com/v2/transparents/simulate-payment?id=${pagamento.id_transacao}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.ABACATE_API_KEY}` },
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await response.json();
    if (!response.ok) {
      throw new HttpException(
        result.error || 'Erro ao simular pagamento na AbacatePay',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Atualiza localmente para testes e para alimentar o relatório financeiro
    await this.prisma.pagamentos.update({
      where: { id: pagamentoId },
      data: {
        status: 'Confirmado',
        pago_em: new Date(),
      },
    });

    if (pagamento.agendamento_id) {
      try {
        await this.prisma.agendamentos.update({
          where: { id: pagamento.agendamento_id },
          data: { status: 'CONFIRMADO' },
        });
      } catch (e) {
        this.logger.warn(
          `Erro ao atualizar agendamento ${pagamento.agendamento_id}:`,
          e,
        );
      }
    }

    return { success: true, message: 'Pagamento simulado com sucesso' };
  }

  async getRelatorioFinanceiro(barbeiroId: number) {
    const agora = new Date();

    const inicioHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );
    const fimHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      23,
      59,
      59,
      999,
    );

    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(
      agora.getFullYear(),
      agora.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const inicioAno = new Date(agora.getFullYear(), 0, 1);
    const fimAno = new Date(agora.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Busca os pagamentos confirmados do barbeiro
    const pagamentos = await this.prisma.pagamentos.findMany({
      where: {
        status: 'Confirmado',
        agendamentos: {
          barbeiro_id: barbeiroId,
        },
      },
      include: {
        agendamentos: {
          include: {
            servicos: true,
            clientes: {
              include: {
                usuarios: true,
              },
            },
          },
        },
      },
      orderBy: { pago_em: 'desc' },
    });

    let faturamentoHoje = 0;
    let faturamentoMes = 0;
    let faturamentoAno = 0;
    let faturamentoTotal = 0;

    const transacoesRecentes: Array<{
      id: number;
      agendamentoId: number;
      clienteNome: string;
      servicoNome: string;
      valor: number;
      data: Date;
      metodo: string;
      status: string | null;
    }> = [];

    for (const pag of pagamentos) {
      const valor = Number(pag.valor);
      const dataPagamento = pag.pago_em ? new Date(pag.pago_em) : new Date();

      faturamentoTotal += valor;

      if (dataPagamento >= inicioHoje && dataPagamento <= fimHoje) {
        faturamentoHoje += valor;
      }
      if (dataPagamento >= inicioMes && dataPagamento <= fimMes) {
        faturamentoMes += valor;
      }
      if (dataPagamento >= inicioAno && dataPagamento <= fimAno) {
        faturamentoAno += valor;
      }

      if (transacoesRecentes.length < 15) {
        transacoesRecentes.push({
          id: pag.id,
          agendamentoId: pag.agendamento_id,
          clienteNome: pag.agendamentos.clientes?.usuarios?.nome || 'Cliente',
          servicoNome: pag.agendamentos.servicos?.nome || 'Serviço',
          valor,
          data: pag.pago_em || pag.agendamentos.data,
          metodo: pag.metodo,
          status: pag.status,
        });
      }
    }

    const totalAtendimentos = pagamentos.length;
    const ticketMedio =
      totalAtendimentos > 0 ? faturamentoTotal / totalAtendimentos : 0;

    return {
      faturamentoHoje,
      faturamentoMes,
      faturamentoAno,
      faturamentoTotal,
      totalAtendimentos,
      ticketMedio,
      transacoesRecentes,
    };
  }
}
