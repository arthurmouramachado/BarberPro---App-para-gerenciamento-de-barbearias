import { IsInt, IsString, Min, Max } from 'class-validator';

export class CreateDisponibilidadeDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dia_da_semana!: number;

  @IsString()
  hora_inicio!: string;

  @IsString()
  hora_fim!: string;
}
