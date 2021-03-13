import { Injectable } from '@nestjs/common';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';

@Injectable()
export class PackService {
  create(createPackDto: CreatePackDto) {
    return 'This action adds a new pack';
  }

  findAll() {
    return `This action returns all pack`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pack`;
  }

  update(id: number, updatePackDto: UpdatePackDto) {
    return `This action updates a #${id} pack`;
  }

  remove(id: number) {
    return `This action removes a #${id} pack`;
  }
}
