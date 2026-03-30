import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BarbeirosModule } from 'src/barbeiros/barbeiros.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [DatabaseModule, BarbeirosModule, ClientesModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
