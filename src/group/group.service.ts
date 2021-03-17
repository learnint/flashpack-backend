import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Not, Repository } from 'typeorm';
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
import { StringUtil } from 'src/util/string.util';
import { GroupAdminDto } from './dto/group-admin.dto';

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
    const stringUtil: StringUtil = new StringUtil();
    let groupByEmail;

    if (isUpdate) {
      groupByEmail = await this.groupRepository.findOne({
        where: {
          id: Not(id),
          name: stringUtil.makeName(group.name),
        },
      });
    } else groupByEmail = await this.findOneByName(group.name);

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
    const stringUtil: StringUtil = new StringUtil();
    const group = await this.groupRepository.findOne({
      where: { name: stringUtil.makeName(name) },
    });
    return group || undefined;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    //Not found and conflict exceptions
    if (!group) throw new NotFoundException(`Group with ID: '${id}' not found`);
    await this.detectDuplicate(Group.create(updateGroupDto), id, true);

    if (updateGroupDto.password && updateGroupDto.newPassword) {
      const isMatch = group
        ? await bcrypt.compare(updateGroupDto.password, group.password)
        : false;
      if (!isMatch) {
        throw new ConflictException('original password does not match records');
      } else updateGroupDto.password = updateGroupDto.newPassword;
    }

    //update
    for (const key in updateGroupDto) {
      if (updateGroupDto[key] !== group[key] && updateGroupDto[key] !== null)
        group[key] = updateGroupDto[key];
    }
    return await this.groupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    if (!group) throw new NotFoundException(`Group with ID: '${id}' not found`);
    await this.groupRepository.delete(id);
  }

  async findGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
    const groupMembers = await this.groupMemberRepository.find({
      where: { group: groupId },
      relations: ['group', 'user'],
    });
    const dto = plainToClass(GroupMemberDto, groupMembers);
    for (const member of dto){
      member.group = plainToClass(GroupDto, member.group);
      member.user = plainToClass(UserDto, member.user);
    }
    return dto;
  }

  async createGroupMemberDto(groupMember: GroupMember): Promise<GroupMemberDto>{
    const groupId = groupMember.group.id ? groupMember.group.id : groupMember.group.toString();
    const groupMemberFind = await this.groupMemberRepository.findOne({
       where: { group: groupId },
       relations: ['group', 'user'],
      });
    const dto =  plainToClass(GroupMemberDto, groupMemberFind);
    dto.user = plainToClass(UserDto, dto.user);
    dto.group = await this.createGroupDto(groupMember.group);
    return dto;
  }

  async createGroupAdminDto(groupAdmin: GroupAdmin): Promise<GroupAdminDto>{
    const groupId = groupAdmin.group.id ? groupAdmin.group.id : groupAdmin.group.toString();
    const groupAdminFind = await this.groupAdminRepository.findOne({
       where: { group: groupId },
       relations: ['group', 'user'],
      });
    const dto =  plainToClass(GroupAdminDto, groupAdminFind);
    dto.user = plainToClass(UserDto, dto.user);
    dto.group = await this.createGroupDto(groupAdmin.group);
    return dto;
  }

  //prepares an array of GroupDto objects
  async createGroupDtoArray(groups: Group[]): Promise<GroupDto[]> {
    const groupDtoArr: GroupDto[] = [];
    for (const group of groups) {
      groupDtoArr.push(await this.createGroupDto(group));
    }
    return groupDtoArr;
  }

  //prepares a GroupDto object based off of a Group.
  // creates the dto property values for 'memberNames' and 'memberCount'
  async createGroupDto(group: Group): Promise<GroupDto> {
    const groupDto = plainToClass(GroupDto, group);
    const groupMembers = await this.findGroupMembers(group.id);
    const memberNames: string[] = [];

    for (const member of groupMembers) {
      const fullName = `${member.user.firstName.trim()} ${member.user.lastName.trim()}`;
      memberNames.push(fullName);
    }
    groupDto.memberNames = memberNames.sort();
    groupDto.memberCount = groupDto.memberNames.length;
    return groupDto;
  }

  async leaveGroup(userId: string, groupId: string): Promise<void> {
    const groupMember = await this.groupMemberRepository.find({
      where: { group: groupId, user: userId },
    });
    if (!groupMember)
      throw new NotFoundException(
        `No Group member with group ID: '${groupId}' and userId: '${userId}' found`,
      );
    await this.groupMemberRepository.remove(groupMember);
  }

  async userIsAdmin(id: string): Promise<boolean> {
    return await this.userService.isAdmin(id);
  }

  async isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    const groupAdmin = await this.groupAdminRepository.findOne({
      where: {
        user: userId,
        group: groupId,
      },
    });
    return groupAdmin ? true : false;
  }

  async isGroupMember(userId: string, groupId: string): Promise<boolean> {
    const groupMember = await this.groupMemberRepository.findOne({
      where: {
        user: userId,
        group: groupId,
      },
    });
    return groupMember ? true : false;
  }
}
