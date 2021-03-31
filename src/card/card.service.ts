import {
  ForbiddenException,
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
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {}

  async create(createCardDto: CreateCardDto, userId: string) {
    const card = Card.create(createCardDto);
    const isAdmin = await this.userIsAdmin(userId);
    const pack = plainToClass(
      Pack,
      await this.packService.findOne(createCardDto.packId),
    );
    card.pack = pack ? pack : undefined;
    if (!card.pack) throw new NotFoundException('Pack does not exist');

    const packType = await this.packService.detectType(pack);
    if (packType === PackType.Group) {
      const isGroupAdmin = await this.groupService.isGroupAdmin(
        userId,
        pack.groupPack.group.id,
      );

      if (!isAdmin && !isGroupAdmin) throw new ForbiddenException();
    } else if (packType === PackType.User) {
      if (!isAdmin && userId !== pack.userPack.user.id)
        throw new ForbiddenException();
    }
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

  async userIsAdmin(userId: string): Promise<boolean> {
    return await this.userService.isAdmin(userId);
  }
}
