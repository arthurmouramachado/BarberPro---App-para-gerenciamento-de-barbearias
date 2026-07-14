/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BarbeariasService } from './barbearias.service';
import { CreateBarbeariaDto } from './dto/create-barbearia.dto';
import { UpdateBarbeariaDto } from './dto/update-barbearia.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller('barbearias')
export class BarbeariasController {
  constructor(private readonly barbeariasService: BarbeariasService) {}

  @Post('criar')
  @UseInterceptors(
    FileInterceptor('foto', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      storage: diskStorage({
        destination: './uploads',
        filename: (
          _req: any,
          file: { originalname: string },
          cb: (arg0: null, arg1: string) => void,
        ) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `barbearia-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() createBarbeariaDto: CreateBarbeariaDto,
    @UploadedFile() file?: any, // Captura o arquivo salvo
  ) {
    if (file) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      createBarbeariaDto.foto_url = `/uploads/${file.filename}`;
    }

    return this.barbeariasService.create(createBarbeariaDto);
  }

  @Get()
  findAll() {
    return this.barbeariasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbeariasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBarbeariaDto: UpdateBarbeariaDto,
  ) {
    return this.barbeariasService.update(+id, updateBarbeariaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barbeariasService.remove(+id);
  }
}
