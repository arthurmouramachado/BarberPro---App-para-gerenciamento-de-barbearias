import { Module } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ClientesService } from 'src/clientes/clientes.service';
import { ServicosService } from 'src/servicos/servicos.service';
import { BarbeariasService } from 'src/barbearias/barbearias.service';
import { BarbeirosService } from 'src/barbeiros/barbeiros.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AgendamentosController],
  providers: [
    AgendamentosService,
    BarbeariasService,
    BarbeirosService,
    ClientesService,
    ServicosService,
  ],
  exports: [AgendamentosService],
})
export class AgendamentosModule {}
