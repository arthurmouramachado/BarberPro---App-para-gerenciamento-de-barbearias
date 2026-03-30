import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientesController } from './clientes/clientes.controller';
import { ClientesService } from './clientes/clientes.service';
import { ClientesModule } from './clientes/clientes.module';
import { DatabaseModule } from './database/database.module';
import { FinanceiroRelatoriosModule } from './financeiro-relatorios/financeiro-relatorios.module';
import { DisponibilidadeModule } from './disponibilidade/disponibilidade.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { ServicosModule } from './servicos/servicos.module';
import { BarbeariasModule } from './barbearias/barbearias.module';
import { BarbeirosModule } from './barbeiros/barbeiros.module';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ClientesModule,
    BarbeirosModule,
    UserModule,
    BarbeariasModule,
    ServicosModule,
    AgendamentosModule,
    PagamentosModule,
    NotificacoesModule,
    AvaliacoesModule,
    DisponibilidadeModule,
    FinanceiroRelatoriosModule,
    DatabaseModule,
    ConfigModule.forRoot(),
    AuthModule,
  ],
  controllers: [UserController, ClientesController],
  providers: [UserService, ClientesService],
})
export class AppModule {}
