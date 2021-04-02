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
  Patch,
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
import { GroupMember } from './entities/group-member.entity';
import { JoinGroupDto } from './dto/join-group.dto';
import { GroupMemberDto } from './dto/group-member.dto';
import { GroupAdminDto } from './dto/group-admin.dto';
import { InviteDto } from './dto/invite.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('group')
@Controller('/api')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly userSerice: UserService,
  ) {}

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
  @Post('group')
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @Req() req,
  ): Promise<GroupDto> {
    const group = await this.groupService.create(createGroupDto, req.user.id);
    return await this.groupService.createGroupDto(group, req.user.id);
  }

  // //directly join the group via group admin or user admin.
  // @ApiBadRequestResponse({
  //   description: 'Model broken somewhere in the request',
  // })
  // @ApiNotFoundResponse({ description: 'User or Group not found' })
  // @ApiForbiddenResponse({ description: 'User is forbidden' })
  // @ApiCreatedResponse({ description: 'Joined Group', type: Group })
  // @ApiUnauthorizedResponse({ description: 'Not authorized' })
  // @ApiInternalServerErrorResponse({
  //   description: 'An internal server error occured',
  // })
  // @ApiQuery({ name: 'id', required: false })
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  // @Post('/join')
  // async joinGroup(
  //   @Body() joinGroupDto: JoinGroupDto,
  //   @Query('id') id: string,
  //   @Req() req,
  // ): Promise<GroupMemberDto> {
  //   //ensure user is itself or a userAdmin or a GroupAdmin of the group
  //   const isAdmin = this.groupService.userIsAdmin(req.user.id);
  //   const isGroupAdmin = this.groupService.isGroupAdmin(
  //     req.user.id,
  //     joinGroupDto.groupId,
  //   );
  //   if (!isAdmin && !isGroupAdmin) {
  //     if (id && id !== req.user.id) {
  //       throw new ForbiddenException();
  //     }
  //   }

  //   const groupMember = await this.groupService.joinGroup(
  //     id ? id : req.user.id,
  //     joinGroupDto.groupId,
  //     true,
  //   );

  //   return await this.groupService.createGroupMemberDto(groupMember);
  // }

  // setup unconfirmed invite(s) to group. this uses the invite system
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiCreatedResponse({
    description: 'Created new GroupMember',
    type: GroupMember,
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('group/:id/users')
  async inviteInit(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() inviteDto: InviteDto,
    @Req() req,
  ): Promise<GroupMemberDto[]> {
    const isAdmin = this.groupService.userIsAdmin(req.user.id);
    const isGroupAdmin = this.groupService.isGroupAdmin(req.user.id, groupId);
    const groupMemberDtos: GroupMemberDto[] = [];
    if (!isAdmin && !isGroupAdmin) {
      throw new ForbiddenException();
    }

    for (const email of inviteDto['emails']) {
      const user = await this.userSerice.findOneByEmail(email);
      if (user) {
        const join = await this.groupService.joinGroup(user.id, groupId);
        groupMemberDtos.push(
          await this.groupService.createGroupMemberDto(join),
        );
      }
    }

    return groupMemberDtos;
  }

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiCreatedResponse({
    description: 'Created new GroupMember',
    type: GroupMember,
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('group/:id/join')
  async acceptJoin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<GroupMemberDto> {
    return await this.groupService.acceptJoin(id, req.user.id);
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
  @Post('group/joinAdmin')
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
    );

    return await this.groupService.createGroupAdminDto(groupAdmin);
  }

  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('groups')
  async findAll(@Req() req): Promise<GroupDto[]> {
    return await this.groupService.createGroupDtoArray(
      await this.groupService.findAllForUser(req.user.id),
      req.user.id,
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
  @Get('group/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<GroupDto> {
    const group = await this.groupService.findOne(id);
    if (!group) throw new NotFoundException(`Group with id: '${id}' not found`);
    const groupDto = await this.groupService.createGroupDto(group, req.user.id);
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
  @Put('group/:id')
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

    return await this.groupService.createGroupDto(
      await this.groupService.update(id, updateGroupDto),
      req.user.id,
    );
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
  @Delete('group/:id/leave')
  async leaveGroup(
    @Query('userId') userId: string,
    @Param('id', ParseUUIDPipe) groupId: string,
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
      //userId ? userId :
      req.user.id,
      groupId,
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
  @Delete('group/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    if (
      !this.groupService.userIsAdmin(req.user.id) &&
      !this.groupService.isGroupAdmin(req.user.id, id)
    )
      throw new ForbiddenException();
    return await this.groupService.remove(id);
  }
}
