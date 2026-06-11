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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          id_transacao: String(result.data.id),
        },
      });

      return {
        pagamentoId: novoPagamento.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        brCode: result.data.brCode,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (payload.event !== 'transparent.completed') {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dataObjeto = payload.data || payload;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!dataObjeto.id) return { message: 'Ignorado' };

    const pagamentoLocal = await this.prisma.pagamentos.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where: { id_transacao: String(dataObjeto.id) },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (pagamentoLocal && dataObjeto.status === 'PAID') {
      await this.prisma.pagamentos.update({
        where: { id: pagamentoLocal.id },
        data: { status: 'Confirmado' },
      });
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        result.error || 'Erro ao listar cobrancas na AbacatePay',
        HttpStatus.BAD_REQUEST,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        result.error || 'Erro ao consultar status na AbacatePay',
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (result.data?.status === 'PAID' && pagamento.status !== 'Confirmado') {
      await this.prisma.pagamentos.update({
        where: { id: pagamentoId },
        data: { status: 'Confirmado' },
      });
    }

    return {
      localId: pagamento.id,
      localStatus: pagamento.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      abacateStatus: result.data?.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        result.error || 'Erro ao simular pagamento na AbacatePay',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true, message: 'Pagamento simulado com sucesso' };
  }
}
