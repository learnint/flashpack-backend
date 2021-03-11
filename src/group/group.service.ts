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
import { GroupMember } from './entities/group-member.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    private readonly userService: UserService,
  ) {}

  async create(createGroupDto: CreateGroupDto, id: string): Promise<Group> {
    const newGroup = Group.create(createGroupDto);
    // detect existing group name
    await this.detectDuplicate(newGroup, id);

    newGroup.createdByUser = await this.userService.findOne(id);
    newGroup.createdByName = `${newGroup.createdByUser.firstName} ${newGroup.createdByUser.lastName}`;
    newGroup.link = 'http://localhost';

    const savedGroup = await this.groupRepository.save(newGroup);
    // auto join group creator to group
    if (savedGroup) await this.createGroupMember(newGroup);

    // save the new group and return the details
    return savedGroup;
  }

  private async createGroupMember(group: Group): Promise<GroupMember> {
    const groupMember = GroupMember.create();
    groupMember.group = group;
    groupMember.user = await this.userService.findOne(group.createdByUser.id);
    return await this.groupMemberRepository.save(groupMember);
  }

  async joinGroup(userId: string, groupId: string): Promise<GroupMember> {
    const group = await this.findOne(groupId);
    const user = await this.userService.findOne(userId);

    if(!group || !user)
      throw new NotFoundException(!user ? `User with ID: '${userId}' not found` : `Group with ID: '${groupId}' not found`);

    const groupMember = GroupMember.create();
    groupMember.group = group;
    groupMember.user = user;
    return await this.groupMemberRepository.save(groupMember);
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
    const group = await this.groupRepository.findOne(id);
    const groupMembers = (await (await this.groupMemberRepository.find()));//.filter(x => x.group.id === id));
    group.groupMembers = groupMembers.filter(x => x.group.toString() === group.id);
    return await group;
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

  async userIsAdmin(id: string): Promise<boolean> {
    return await this.userService.isAdmin(id);
  }
}
