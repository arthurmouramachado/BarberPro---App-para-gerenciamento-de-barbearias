import { Module } from '@nestjs/common';
import { BarbeariasService } from './barbearias.service';
import { BarbeariasController } from './barbearias.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BarbeariasController],
  providers: [BarbeariasService, PrismaService],
  exports: [BarbeariasService],
})
export class BarbeariasModule {}
