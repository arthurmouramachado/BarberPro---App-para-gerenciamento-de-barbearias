import { PartialType } from '@nestjs/mapped-types';
import { CreateDisponibilidadeDto } from './create-disponibilidade.dto';

export class UpdateDisponibilidadeDto extends PartialType(
  CreateDisponibilidadeDto,
) {}
