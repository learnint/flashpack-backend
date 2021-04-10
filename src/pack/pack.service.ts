import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
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
import { CreatePackDto } from './dto/create-pack.dto';
import { PackDto } from './dto/pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { GroupPack } from './entities/group-pack.entity';
import { Pack } from './entities/pack.entity';
import { UserPack } from './entities/user-pack.entity';

@Injectable()
export class PackService {
  constructor(
    @InjectRepository(Pack) private readonly packRepository: Repository<Pack>,
    @InjectRepository(UserPack)
    private readonly userPackRepository: Repository<UserPack>,
    @InjectRepository(GroupPack)
    private readonly groupPackRepository: Repository<GroupPack>,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async detectType(pack: Pack): Promise<PackType> {
    let type: PackType;

    if (pack && (pack.userPack || pack.groupPack))
      type = pack.userPack
        ? PackType.User
        : pack.groupPack
        ? PackType.Group
        : undefined;

    return type || undefined;
  }

  async createUserPack(
    createPackDto: CreatePackDto,
    userId: string,
  ): Promise<PackDto> {
    const pack = Pack.create(createPackDto);
    const user = await this.userService.findOne(userId);
    if (!user)
      throw new NotFoundException(`User with id: '${userId}' does not exist`);
    const userPack = UserPack.create();
    userPack.pack = pack;
    userPack.user = user;

    pack.userPack = userPack;
    await this.packRepository.save(pack);
    return await this.createPackDto(await this.findOne(pack.id));
  }

  async createGroupPack(
    createPackDto: CreatePackDto,
    groupId: string,
  ): Promise<PackDto> {
    const pack = Pack.create(createPackDto);
    const group = await this.groupService.findOne(groupId);
    if (!group)
      throw new NotFoundException(`Group with id: '${groupId}' does not exist`);
    const groupPack = GroupPack.create();
    groupPack.pack = pack;
    groupPack.group = group;

    pack.groupPack = groupPack;
    await this.packRepository.save(pack);
    return await this.createPackDto(await this.findOne(pack.id));
  }

  async findOne(id: string): Promise<Pack> {
    const pack = await this.packRepository.findOne(id, {
      relations: ['groupPack', 'userPack'],
    });
    return pack;
  }

  async createPackDto(pack: Pack): Promise<PackDto> {
    const dto = plainToClass(PackDto, pack);
    if (dto) {
      if (dto.userPack)
        dto.userPack.user = plainToClass(UserDto, dto.userPack.user);

      if (dto.groupPack)
        dto.groupPack.group = plainToClass(GroupDto, dto.groupPack.group);
    }
    return dto;
  }

  async createPacksDto(packs: Pack[]): Promise<PackDto[]> {
    const packsDto: PackDto[] = [];
    for (const s of packs) {
      packsDto.push(await this.createPackDto(s));
    }

    return packsDto;
  }

  async findAll(): Promise<Pack[]> {
    const packs = await this.packRepository.find({
      relations: ['groupPack', 'userPack'],
    });

    return packs;
  }

  async findAllForUserOrGroup(id: string, type: PackType): Promise<Pack[]> {
    const packs: Pack[] = [];
    switch (type) {
      case PackType.User: {
        const user = await this.userService.findOne(id);
        if (!user)
          throw new NotFoundException(`User with ID: '${id}' not found`);
        const userPacks = await this.userPackRepository.find({
          where: { user: user },
          relations: ['pack'],
        });
        for (const userPack of userPacks) {
          packs.push(plainToClass(Pack, userPack.pack));
        }
        break;
      }
      case PackType.Group: {
        const group = await this.groupService.findOne(id);
        if (!group)
          throw new NotFoundException(`Group with ID: '${id}' not found`);
        const groupPacks = await this.groupPackRepository.find({
          where: { group: group },
          relations: ['pack'],
        });
        for (const groupPack of groupPacks) {
          packs.push(plainToClass(Pack, groupPack.pack));
        }
        break;
      }
      default:
        break;
    }
    return packs;
  }

  async update(id: string, updatePackDto: UpdatePackDto): Promise<Pack> {
    const pack = await this.findOne(id);
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

  async checkForbidden(
    userId: string,
    pack: Pack,
    readOnly = true,
    groupId?: string,
  ): Promise<void> {
    const type = await this.detectType(pack);
    const isAdmin = await this.userIsAdmin(userId);

    // *****  BEGIN SPECIAL CASE  ******
    // special case for the GET with groupId specified.
    // need to make sure the user is a group member
    // even if the pack array is empty
    const isGroupMemberPrelim = groupId
      ? await this.groupService.isGroupMember(userId, groupId)
      : undefined;

    if (isGroupMemberPrelim !== undefined && isGroupMemberPrelim === false) {
      throw new ForbiddenException();
    }
    // ****** END SPECIAL CASE  ******

    if (type && type === PackType.User) {
      if (userId !== pack.userPack.user.id && !isAdmin)
        throw new ForbiddenException();
    } else if (type === PackType.Group) {
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
