import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNumber()
  preco!: number;

  @IsInt()
  duracao_minutos!: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
