import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
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
    await this.detectDuplicate(newGroup, id);

    newGroup.createdByUser = await this.userService.findOne(id);
    newGroup.createdByName = `${newGroup.createdByUser.firstName} ${newGroup.createdByUser.lastName}`;
    newGroup.link = 'http://localhost';

    // save the new group and return the details
    return await this.groupRepository.save(newGroup);
  }

  private async detectDuplicate(group: Group, id: string, isUpdate = false) {
    let groupByEmail = await this.findOneByName(group.name);

    if (isUpdate) {
      const allGroups: Group[] = await this.findAll();
      const allGroupsExceptMe = allGroups.filter((x) => x.id !== id);

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

  async findOne(id: string): Promise<Group> {
    return await this.groupRepository.findOne(id);
  }

  async findOneByName(name: string): Promise<Group> {
    const groups: Group[] = await this.findAll();
    const group: Group = groups.find((x) => x.name === name);
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOne(id);

    //Not found and conflict exceptions
    if (!group) throw new NotFoundException(`Group with ID: '${id}' not found`);
    await this.detectDuplicate(Group.create(updateGroupDto), id, true);

    //update
    for (const key in updateGroupDto) {
      if (updateGroupDto[key] !== group[key] && updateGroupDto[key] !== null)
        group[key] = updateGroupDto[key];
    }
    return await this.groupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    await this.groupRepository.delete(id);
  }

  async isAdmin(id: string): Promise<boolean>{
    return await (await this.userService.findOne(id)).isAdmin;
  }
}
