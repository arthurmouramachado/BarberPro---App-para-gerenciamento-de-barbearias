import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateNotificacoeDto {
  @IsString()
  mensagem!: string;

  @IsOptional()
  @IsBoolean()
  lida?: boolean;
}
