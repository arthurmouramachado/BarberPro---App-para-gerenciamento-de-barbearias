//import { IsInt, IsDateString, IsString } from 'class-validator';

export class CreateDisponibilidadeDto {
  barbeiro_id!: number;
  dia_da_semana!: string;
  hora_inicio!: string;
  hora_fim!: string;
}
