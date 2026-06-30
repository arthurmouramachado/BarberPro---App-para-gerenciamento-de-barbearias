import { IsNumber, IsOptional, IsString } from 'class-validator';
export class CreatePagamentoDto {
  @IsNumber()
  agendamento_id!: number;
  @IsString()
  metodo!: string;
  @IsNumber()
  valor!: number;
  @IsString()
  cpf!: string;
  @IsString()
  @IsOptional()
  status?: string;
  @IsString()
  @IsOptional()
  id_transacao?: string;
}
