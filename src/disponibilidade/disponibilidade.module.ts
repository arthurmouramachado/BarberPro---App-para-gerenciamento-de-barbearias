import { Module } from '@nestjs/common';
import { DisponibilidadeService } from './disponibilidade.service';
import { DisponibilidadeController } from './disponibilidade.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/database/prisma.service';
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [DisponibilidadeController],
  providers: [DisponibilidadeService, PrismaService],
  exports: [DisponibilidadeService],
})
export class DisponibilidadeModule {}
