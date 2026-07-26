import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export type Funcao = 'ADMIN' | 'BARBEIRO' | 'CLIENTE';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome!: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  senha!: string;

  @IsEnum(['ADMIN', 'BARBEIRO', 'CLIENTE'], {
    message: 'Função deve ser ADMIN, BARBEIRO ou CLIENTE',
  })
  funcao!: Funcao;

  @IsString()
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
  data_nascimento!: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  // Campos do barbeiro
  @IsString()
  @IsOptional()
  especialidade?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
