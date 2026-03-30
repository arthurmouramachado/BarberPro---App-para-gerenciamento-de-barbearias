import { PartialType } from '@nestjs/mapped-types';
import { CreateBarbeariaDto } from './create-barbearia.dto';

export class UpdateBarbeariaDto extends PartialType(CreateBarbeariaDto) {}
