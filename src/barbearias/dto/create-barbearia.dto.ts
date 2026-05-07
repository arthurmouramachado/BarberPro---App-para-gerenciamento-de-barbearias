import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBarbeariaDto {
  @IsString()
  nome!: string;

  @IsString()
  endereco?: string;

  @IsString()
  telefone?: string;

  @IsUrl({}, { message: 'A URL da imagem é inválida' })
  @IsOptional()
  foto_url?: string;
}
