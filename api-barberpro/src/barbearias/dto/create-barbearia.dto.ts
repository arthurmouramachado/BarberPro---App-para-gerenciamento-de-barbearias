import { IsOptional, IsString } from 'class-validator';

export class CreateBarbeariaDto {
  @IsString()
  nome!: string;

  @IsString()
  endereco?: string;

  @IsString()
  telefone?: string;

  @IsString()
  @IsOptional()
  foto_url?: string;
}
