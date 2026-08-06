import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @UseGuards(AuthGuard)
  @Post('pagar')
  create(@Body() createPagamentoDto: CreatePagamentoDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.pagamentosService.create(createPagamentoDto, req.user);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const rawBody = req.rawBody as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const webhookSecret = req.query.webhookSecret as string | undefined;

    return this.pagamentosService.handleWebhook(
      body,
      rawBody,
      signature,
      webhookSecret,
    );
  }

  @UseGuards(AuthGuard)
  @Get('abacate/listar')
  listarAbacate() {
    return this.pagamentosService.listarAbacate();
  }

  @UseGuards(AuthGuard)
  @Post('simular/:id')
  simular(@Param('id') id: string) {
    return this.pagamentosService.simularPagamento(+id);
  }

  @UseGuards(AuthGuard)
  @Get(':id/status')
  checkStatus(@Param('id') id: string) {
    return this.pagamentosService.checkAbacateStatus(+id);
  }

  @UseGuards(AuthGuard)
  @Get('relatorio/barbeiro/:id')
  getRelatorioFinanceiro(@Param('id') barbeiroId: string) {
    return this.pagamentosService.getRelatorioFinanceiro(+barbeiroId);
  }

  @Get()
  findAll() {
    return this.pagamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePagamentoDto: UpdatePagamentoDto,
  ) {
    return this.pagamentosService.update(+id, updatePagamentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagamentosService.remove(+id);
  }
}
