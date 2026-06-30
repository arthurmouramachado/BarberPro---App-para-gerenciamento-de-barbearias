import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientesModule } from './clientes/clientes.module';
import { DatabaseModule } from './database/database.module';
import { DisponibilidadeModule } from './disponibilidade/disponibilidade.module';
import { AvaliacaoModule } from './avaliacoes/avaliacao.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { ServicosModule } from './servicos/servicos.module';
import { BarbeariasModule } from './barbearias/barbearias.module';
import { BarbeirosModule } from './barbeiros/barbeiros.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ClientesService } from './clientes/clientes.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { ClientesController } from './clientes/clientes.controller';
import { BarbeirosController } from './barbeiros/barbeiros.controller';
import { PagamentosService } from './pagamentos/pagamentos.service';
import { PagamentosModule } from './pagamentos/pagamentos.module';
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
    AvaliacaoModule,
    DisponibilidadeModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [UserController, ClientesController, BarbeirosController],
  providers: [UserService, ClientesService, PagamentosService],
})
export class AppModule {}
