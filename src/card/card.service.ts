import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { GroupService } from 'src/group/group.service';
import { PackType } from 'src/pack/constants';
import { Pack } from 'src/pack/entities/pack.entity';
import { PackService } from 'src/pack/pack.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CardDto } from './dto/card.dto';
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
    @Inject(forwardRef(() => PackService))
    private readonly packService: PackService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = Card.create(createCardDto);
    const pack = plainToClass(
      Pack,
      await this.packService.findOne(createCardDto.packId),
    );
    card.pack = pack ? pack : undefined;
    if (!card.pack)
      throw new NotFoundException(
        `Pack with id: '${createCardDto.packId}' does not exist`,
      );

    return await this.cardRepository.save(card);
  }

  async findAllForPack(packId: string): Promise<Card[]> {
    return await this.cardRepository.find({
      where: { pack: packId },
      relations: ['options'],
    });
  }

  async findOne(id: string): Promise<Card> {
    return await this.cardRepository.findOne(id, { relations: ['options'] });
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardRepository.findOne(id);
    if (!card) throw new NotFoundException(`Card with ID: '${id}' not found`);
    if (updateCardDto.options && updateCardDto.options.length > 0) {
      console.log('here');
      const options = await this.cardOptionRepository.find({
        where: { card: id },
      });

      for (const option of options) {
        await this.cardOptionRepository.remove(option);
      }
    }
    for (const key in updateCardDto) {
      if (updateCardDto[key] !== card[key] && updateCardDto[key] !== null) {
        if (
          (key === 'options' && updateCardDto.options.length > 0) ||
          key !== 'options'
        )
          card[key] = updateCardDto[key];
      }
    }
    return await this.cardRepository.save(card);
  }

  async remove(card: Card): Promise<void> {
    await this.cardRepository.remove(card);
  }

  async userIsAdmin(userId: string): Promise<boolean> {
    return await this.userService.isAdmin(userId);
  }

  async createCardDto(card: Card): Promise<CardDto> {
    const dto = plainToClass(CardDto, card);
    dto.packId = card.pack.id;
    return dto;
  }

  async createCardsDto(cards: Card[]): Promise<CardDto[]> {
    const cardsDto: CardDto[] = [];
    for (const c of cards) {
      cardsDto.push(await this.createCardDto(c));
    }
    return cardsDto;
  }

  async checkForbidden(userId: string, packId: string): Promise<void> {
    const pack = await this.packService.findOne(packId);
    await this.packService.checkForbidden(userId, pack);
  }
}
