import { Module } from '@nestjs/common';
import { BarbeirosService } from './barbeiros.service';
import { BarbeirosController } from './barbeiros.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [BarbeirosController],
  providers: [BarbeirosService, PrismaService],
  exports: [BarbeirosService],
})
export class BarbeirosModule {}
