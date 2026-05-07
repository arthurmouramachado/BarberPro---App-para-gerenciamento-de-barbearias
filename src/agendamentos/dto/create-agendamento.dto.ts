import { IsInt, IsDateString, IsString } from 'class-validator';

export class CreateAgendamentoDto {
  @IsInt()
  cliente_id!: number;

  @IsInt()
  barbeiro_id!: number;

  @IsInt()
  servico_id!: number;

  @IsDateString()
  data!: string; // ex: "2025-04-29"

  @IsString()
  hora_inicio!: string; // ex: "09:00:00"

  @IsString()
  hora_fim!: string; // ex: "10:00:00"

  @IsString()
  status?: string; // se não vier, o Prisma usa "Pendente"
}
