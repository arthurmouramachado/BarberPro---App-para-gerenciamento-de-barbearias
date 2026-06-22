import { Module } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { NotificacoesController } from './notificacoes.controller';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NotificacoesController],
  providers: [NotificacoesService, PrismaService, GoogleCalendarService],
  exports: [NotificacoesService, GoogleCalendarService],
})
export class NotificacoesModule {}
