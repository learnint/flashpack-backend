import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupAdmin } from './entities/group-admin.entity';
import { plainToClass } from 'class-transformer';
import { GroupMemberDto } from './dto/group-member.dto';
import { GroupDto } from './dto/group.dto';
import { UserDto } from 'src/user/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(GroupAdmin)
    private readonly groupAdminRepository: Repository<GroupAdmin>,
    private readonly userService: UserService,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    createdById: string,
  ): Promise<Group> {
    const newGroup = Group.create(createGroupDto);
    // detect existing group name
    await this.detectDuplicate(newGroup, createdById);

    newGroup.createdByUser = await this.userService.findOne(createdById);
    newGroup.createdByName = `${newGroup.createdByUser.firstName} ${newGroup.createdByUser.lastName}`;
    newGroup.link = 'http://localhost';

    const savedGroup = await this.groupRepository.save(newGroup);
    if (savedGroup)
      await this.joinGroupAdmin(
        newGroup.createdByUser.id,
        newGroup.id,
        createGroupDto.password,
      );

    // save the new group and return the details
    return savedGroup;
  }

  async joinGroupAdmin(
    userId: string,
    groupId: string,
    password: string,
  ): Promise<GroupAdmin> {
    const group = await this.findOne(groupId);
    const user = await this.userService.findOne(userId);

    if (!group || !user)
      throw new NotFoundException(
        !user
          ? `User with ID: '${userId}' not found`
          : `Group with ID: '${groupId}' not found`,
      );

    const isPasswordMatch = group
      ? await bcrypt.compare(password, group.password)
      : false;

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid group password');
    }
    const groupAdmin = GroupAdmin.create();
    groupAdmin.group = group;
    groupAdmin.user = user;
    return await this.groupAdminRepository.save(groupAdmin);
  }

  async joinGroup(
    userId: string,
    groupId: string,
    password: string,
  ): Promise<GroupMember> {
    const group = await this.findOne(groupId);
    const user = await this.userService.findOne(userId);

    if (!group || !user)
      throw new NotFoundException(
        !user
          ? `User with ID: '${userId}' not found`
          : `Group with ID: '${groupId}' not found`,
      );
    const isPasswordMatch = group
      ? await bcrypt.compare(password, group.password)
      : false;

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid group password');
    }
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

      groupByEmail = allGroupsExceptMe.find(
        (x) => x.name.toLowerCase() === group.name.toLowerCase(),
      );
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
    const user = this.groupRepository.findOne(id);
    return await user;
  }

  async findOneByName(name: string): Promise<Group> {
    const groups: Group[] = await this.findAll();
    const group: Group = groups.find((x) => x.name.toLowerCase() === name.toLowerCase());
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    //Not found and conflict exceptions
    if (!group) throw new NotFoundException(`Group with ID: '${id}' not found`);
    await this.detectDuplicate(Group.create(updateGroupDto), id, true);

    if (updateGroupDto.password && updateGroupDto.newPassword){
      const isMatch = group ? await bcrypt.compare(updateGroupDto.password, group.password) : false;
      if (!isMatch){
        throw new ConflictException('original password does not match records');
      }else updateGroupDto.password = updateGroupDto.newPassword;
    }
    
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

  async findGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
    console.log('inside findgroupmembers');
    const groupMembers = (await this.groupMemberRepository.find()).filter(
      (x) => x.group.id === groupId,
    );
    console.log(groupMembers);
    const dto: GroupMemberDto[] = [];
    if (groupMembers) {
      for (const member of groupMembers) {
        const groupMemberDto = new GroupMemberDto();
        groupMemberDto.group = plainToClass(
          GroupDto,
          await this.findOne(member.group.id),
        );
        groupMemberDto.user = plainToClass(
          UserDto,
          await this.userService.findOne(member.user.id),
        );
        dto.push(groupMemberDto);
      }
    }
    return dto;
  }

  //prepares an array of GroupDto objects
  async createGroupDtoArray(groups: Group[]): Promise<GroupDto[]> {
    console.log("creating dto array");
    const groupDtoArr: GroupDto[] = [];
    for (const group of groups) {
      groupDtoArr.push(await this.createGroupDto(group));
    }

    console.log(groupDtoArr);
    return groupDtoArr;
  }

  //prepares a GroupDto object based off of a Group.
  // creates the dto property values for 'memberNames' and 'memberCount'
  async createGroupDto(group: Group): Promise<GroupDto> {
    console.log('inside createGroupDto');
    const groupDto = plainToClass(GroupDto, group);
    const groupMembers = await this.findGroupMembers(group.id);
    console.log(groupMembers);
    const memberNames: string[] = [];

    for (const member of groupMembers) {
      const fullName = `${member.user.firstName.trim()} ${member.user.lastName.trim()}`;
      memberNames.push(fullName);
    }
    console.log(memberNames);
    groupDto.memberNames = memberNames;
    groupDto.memberCount = groupDto.memberNames.length;
    console.log(groupDto);
    return groupDto;
  }

  async leaveGroup(userId: string, groupId: string): Promise<void> {
    const groupMember = (await this.groupMemberRepository.find()).find(
      (x) => x.group.id === groupId && x.user.id === userId,
    );
    if (!groupMember)
      throw new NotFoundException(
        `No Group member with group ID: '${groupId}' and userId: '${userId}' found`,
      );
    await this.groupMemberRepository.delete(groupMember);
  }

  async userIsAdmin(id: string): Promise<boolean> {
    return await this.userService.isAdmin(id);
  }

  async isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    const groupAdmin = (await this.groupAdminRepository.find()).find(
      (x) => x.user.toString() === userId && x.group.toString() === groupId,
    );

    return groupAdmin ? true : false;
  }

  async isGroupMember (userId: string, groupId: string): Promise<boolean> {
    const groupMember = (await this.groupMemberRepository.find()).find(
      (x) => x.user.id === userId && x.group.id === groupId,
    );

    return groupMember ? true : false;
  }
}
