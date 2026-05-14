import { Module } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BarbeariasService } from 'src/barbearias/barbearias.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ServicosController],
  providers: [ServicosService, PrismaService, BarbeariasService],
  exports: [ServicosService],
})
export class ServicosModule {}
