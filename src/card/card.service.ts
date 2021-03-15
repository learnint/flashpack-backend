import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Pack } from 'src/pack/entities/pack.entity';
import { PackService } from 'src/pack/pack.service';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardOption } from './entities/card-options.entity';
import { Card } from './entities/card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private readonly cardRepository: Repository<Card>,
    @InjectRepository(CardOption)
    private readonly cardOptionRepository: Repository<CardOption>,
    private readonly packService: PackService,
  ) {}

  async create(createCardDto: CreateCardDto) {
    const card = Card.create(createCardDto);
    card.pack = plainToClass(
      Pack,
      await this.packService.findOne(createCardDto.packId),
    );
    return await this.cardRepository.save(card);
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
