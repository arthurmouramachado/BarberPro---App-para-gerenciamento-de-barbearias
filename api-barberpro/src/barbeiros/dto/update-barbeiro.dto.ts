import { PartialType } from '@nestjs/mapped-types';
import { CreateBarbeiroDto } from './create-barbeiro.dto';

export class UpdateBarbeiroDto extends PartialType(CreateBarbeiroDto) {}
