// src/barbeiros/dto/create-barbeiro.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBarbeiroDto {
  @IsInt()
  usuario_id!: number;

  @IsString()
  especialidade!: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsInt()
  @IsOptional()
  barbearia_id?: number;
}
