import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificacoeDto } from './create-notificacoe.dto';

export class UpdateNotificacoeDto extends PartialType(CreateNotificacoeDto) {}
