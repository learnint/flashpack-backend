import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Group } from './entities/group.entity';
import { GroupDto } from './dto/group.dto';
import { plainToClass } from 'class-transformer';
import { GroupMember } from './entities/group-member.entity';
import { GroupAdmin } from './entities/group-admin.entity';
import { JoinGroupDto } from './dto/join-group.dto';
import { GroupMemberDto } from './dto/group-member.dto';
import { GroupAdminDto } from './dto/group-admin.dto';

@ApiTags('group')
@Controller('/api/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new Group', type: Group })
  @ApiConflictResponse({ description: 'Duplicate group name' })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @Req() req,
  ): Promise<GroupDto> {
    const group = await this.groupService.create(createGroupDto, req.user.id);
    return plainToClass(GroupDto, group);
  }

  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiNotFoundResponse({ description: 'User or Group not found' })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiCreatedResponse({ description: 'Joined Group', type: Group })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiQuery({ name: 'id', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/join')
  async joinGroup(
    @Body() joinGroupDto: JoinGroupDto,
    @Query('id') id: string,
    @Req() req,
  ): Promise<GroupMemberDto> {
    //ensure user is itself or a userAdmin or a GroupAdmin of the group
    const isAdmin = this.groupService.userIsAdmin(req.user.id);
    const isGroupAdmin = this.groupService.isGroupAdmin(
      req.user.id,
      joinGroupDto.groupId,
    );
    if (!isAdmin && !isGroupAdmin) {
      if (id && id !== req.user.id) {
        throw new ForbiddenException();
      }
    }

    const groupMember = await this.groupService.joinGroup(
      id ? id : req.user.id,
      joinGroupDto.groupId,
      joinGroupDto.password,
    );

    return await this.groupService.createGroupMemberDto(groupMember);
  }

  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiNotFoundResponse({ description: 'User or Group not found' })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiCreatedResponse({ description: 'Joined as Group Admin', type: Group })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiQuery({ name: 'id', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('joinAdmin')
  async joinGroupAdmin(
    @Body() joinGroupDto: JoinGroupDto,
    @Query('id') id: string,
    @Req() req,
  ): Promise<GroupAdminDto> {
    if (
      !this.groupService.userIsAdmin(req.user.id) &&
      !this.groupService.isGroupAdmin(req.user.id, joinGroupDto.groupId)
    )
      throw new ForbiddenException();
    const groupAdmin = await this.groupService.joinGroupAdmin(
      id ? id : req.user.id,
      joinGroupDto.groupId,
      joinGroupDto.password,
    );

    return await this.groupService.createGroupAdminDto(groupAdmin);
  }

  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<GroupDto[]> {
    return await this.groupService.createGroupDtoArray(
      await this.groupService.findAll(),
    );
  }

  @ApiBadRequestResponse({
    description: 'Invalid UUID',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiNotFoundResponse({ description: 'ID not found' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GroupDto> {
    const group = await this.groupService.findOne(id);
    if (!group) throw new NotFoundException(`Group with id: '${id}' not found`);
    const groupDto = await this.groupService.createGroupDto(group);

    return groupDto;
  }

  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiOkResponse({ description: 'Successfully updated Group', type: Group })
  @ApiConflictResponse({
    description: 'Conflict. Duplicate group name',
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiNotFoundResponse({ description: 'ID not found' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req,
  ): Promise<GroupDto> {
    if (
      !(await this.groupService.userIsAdmin(req.user.id)) &&
      !(await this.groupService.isGroupAdmin(req.user.id, id))
    )
      throw new ForbiddenException();

    return plainToClass(
      GroupDto,
      await this.groupService.update(id, updateGroupDto),
    );
  }

  @ApiBadRequestResponse({
    description: 'Invalid ID',
  })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    if (
      !this.groupService.userIsAdmin(req.user.id) &&
      !this.groupService.isGroupAdmin(req.user.id, id)
    )
      throw new ForbiddenException();
    return await this.groupService.remove(id);
  }

  //TODO: DELETE - i.e leave group, leave group admin.
  @ApiBadRequestResponse({
    description: 'Invalid ID',
  })
  @ApiNotFoundResponse({ description: 'Group member not found' })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('leaveGroup/:groupId')
  async leaveGroup(
    @Query('userId') userId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req,
  ) {
    //ensure user is itself or a userAdmin or a GroupAdmin of the group
    const isAdmin = this.groupService.userIsAdmin(req.user.id);
    const isGroupAdmin = this.groupService.isGroupAdmin(req.user.id, groupId);
    if (!isAdmin && !isGroupAdmin) {
      if (userId && userId !== req.user.id) {
        throw new ForbiddenException();
      }
    }

    return await this.groupService.leaveGroup(
      userId ? userId : req.user.id,
      groupId,
    );
  }
}
