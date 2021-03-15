import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { GroupDto } from 'src/group/dto/group.dto';
import { GroupService } from 'src/group/group.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { PackType } from './constants';
import { CreateGroupPackDto } from './dto/create-group-pack.dto';
import { CreateUserPackDto } from './dto/create-user-pack.dto';
import { PackDto } from './dto/pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { GroupPack } from './entities/group-pack.entity';
import { Pack } from './entities/pack.entity';
import { UserPack } from './entities/user-pack.entity';

@Injectable()
export class PackService {
  constructor(
    @InjectRepository(Pack) private readonly packRepository: Repository<Pack>,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {}

  async detectType(pack: Pack): Promise<PackType> {
    let type: PackType;
    if (pack.userPack || pack.groupPack)
      type = pack.userPack ? PackType.User : PackType.Group;

    return type || undefined;
  }

  async createUserPack(createPackDto: CreateUserPackDto): Promise<PackDto> {
    const pack = Pack.create(createPackDto);
    const user = await this.userService.findOne(createPackDto.userId);
    const userPack = UserPack.create();
    userPack.pack = pack;
    userPack.user = user;

    pack.userPack = userPack;
    await this.packRepository.save(pack);
    return plainToClass(PackDto, await this.findOne(pack.id));
  }

  async createGroupPack(createPackDto: CreateGroupPackDto): Promise<PackDto> {
    const pack = Pack.create(createPackDto);
    const group = await this.groupService.findOne(createPackDto.groupId);
    const groupPack = GroupPack.create();
    groupPack.pack = pack;
    groupPack.group = group;

    pack.groupPack = groupPack;
    await this.packRepository.save(pack);
    return plainToClass(PackDto, await this.findOne(pack.id));
  }

  async findOne(id: string): Promise<PackDto> {
    const pack = await this.packRepository.findOne(id);
    const dto = plainToClass(PackDto, pack);
    if (dto) {
      if (dto.userPack)
        dto.userPack.user = plainToClass(UserDto, dto.userPack.user);

      if (dto.groupPack)
        dto.groupPack.group = plainToClass(GroupDto, dto.groupPack.group);
    }
    return dto;
  }

  async findAll(): Promise<PackDto[]> {
    const packs = await this.packRepository.find();
    const dtoPacks = plainToClass(PackDto, packs);

    for (const dto of dtoPacks) {
      if (dto.userPack)
        dto.userPack.user = plainToClass(UserDto, dto.userPack.user);

      if (dto.groupPack)
        dto.groupPack.group = plainToClass(GroupDto, dto.groupPack.group);
    }

    return dtoPacks;
  }

  async update(id: string, updatePackDto: UpdatePackDto): Promise<Pack> {
    const pack = Pack.create(await this.findOne(id));
    if (!pack) throw new NotFoundException(`Pack with ID: '${id}' not found`);

    //update
    for (const key in updatePackDto) {
      if (updatePackDto[key] !== pack[key] && updatePackDto[key] !== null)
        pack[key] = updatePackDto[key];
    }
    return await this.packRepository.save(pack);
  }

  async remove(pack: Pack) {
    await this.packRepository.remove(pack);
  }

  async userIsAdmin(id: string) {
    return await this.userService.isAdmin(id);
  }

  async checkForbidden(userId: string, pack: PackDto, readOnly = true) {
    const type = await this.detectType(plainToClass(Pack, pack));
    const isAdmin = await this.userIsAdmin(userId);
    if (type === PackType.User) {
      if (userId !== pack.userPack.id && !isAdmin)
        throw new ForbiddenException();
    }
    if (type === PackType.Group) {
      const isGroupAdmin = await this.groupService.isGroupAdmin(
        userId,
        pack.groupPack.group.id,
      );
      const isGroupMember = await this.groupService.isGroupMember(
        userId,
        pack.groupPack.group.id,
      );
      if (readOnly) {
        // i.e if group members can use (readonly methods)
        if (!isGroupAdmin && !isAdmin && !isGroupMember)
          throw new ForbiddenException();
      } else {
        if (!isGroupAdmin && !isAdmin) throw new ForbiddenException();
      }
    }
  }

  async checkForbiddenOnCreate(userId: string, typeId: string, type: PackType) {
    const userIsAdmin = await this.userIsAdmin(userId);
    if (type === PackType.User)
      if (userId !== typeId && !userIsAdmin) throw new ForbiddenException();

    if (type === PackType.Group) {
      const isGroupAdmin = await this.groupService.isGroupAdmin(userId, typeId);
      if (!isGroupAdmin && !userIsAdmin) throw new ForbiddenException();
    }
  }
}
