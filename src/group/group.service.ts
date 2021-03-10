import {
  ConflictException,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly userService: UserService,
  ) {}

  async create(createGroupDto: CreateGroupDto, id: string): Promise<Group> {
    const newGroup = Group.create(createGroupDto);
    // detect existing group name
    await this.detectDuplicate(newGroup);

    newGroup.createdByUser = await this.userService.findOne(id);
    newGroup.createdByName = `${newGroup.createdByUser.firstName} ${newGroup.createdByUser.lastName}`;
    newGroup.link = 'http://localhost';

    // save the new group and return the details
    return await this.groupRepository.save(newGroup);
  }

  private async detectDuplicate(group: Group, isUpdate = false) {
    let groupByEmail = await this.findOneByName(group.name);

    if (isUpdate) {
      const groupById = await this.groupRepository.findOne(group.id);
      const allGroups: Group[] = await this.findAll();
      const allGroupsExceptMe = allGroups.filter((x) => x.id !== groupById.id);

      groupByEmail = allGroupsExceptMe.find((x) => x.name === group.name);
    }
    if (groupByEmail) {
      throw new ConflictException(
        `A Group with the name '${group.name}' already exists.`,
      );
    }
  }

  async findAll(): Promise<Group[]> {
    return await this.groupRepository.find();
  }

  async findOne(id: number): Promise<Group> {
    return await this.groupRepository.findOne(id);
  }

  async findOneByName(name: string): Promise<Group> {
    const groups: Group[] = await this.findAll();
    const group: Group = groups.find((x) => x.name === name);
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOne(id);

    //Not found and conflict exceptions
    if (!group) throw new NotFoundException(`Group with ID: '${id}' not found`);
    await this.detectDuplicate(Group.create(updateGroupDto), true);

    //update
    for (const key in updateGroupDto) {
      if (updateGroupDto[key] !== group[key] && updateGroupDto[key] !== null)
        group[key] = updateGroupDto[key];
    }
    return await this.groupRepository.save(group);
  }

  async remove(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }
}
