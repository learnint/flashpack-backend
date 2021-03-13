import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PackService } from './pack.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';

@Controller('pack')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @Post()
  create(@Body() createPackDto: CreatePackDto) {
    return this.packService.create(createPackDto);
  }

  @Get()
  findAll() {
    return this.packService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePackDto: UpdatePackDto) {
    return this.packService.update(+id, updatePackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packService.remove(+id);
  }
}
