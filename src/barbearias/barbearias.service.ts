import { Injectable } from '@nestjs/common';
import { CreateBarbeariaDto } from './dto/create-barbearia.dto';
import { UpdateBarbeariaDto } from './dto/update-barbearia.dto';

@Injectable()
export class BarbeariasService {
  create(createBarbeariaDto: CreateBarbeariaDto) {
    return 'This action adds a new barbearia';
  }

  findAll() {
    return `This action returns all barbearias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} barbearia`;
  }

  update(id: number, updateBarbeariaDto: UpdateBarbeariaDto) {
    return `This action updates a #${id} barbearia`;
  }

  remove(id: number) {
    return `This action removes a #${id} barbearia`;
  }
}
