import { Module } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ServicosController],
  providers: [ServicosService],
  exports: [ServicosService],
})
export class ServicosModule {}
