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
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Group } from './entities/group.entity';
import { GroupDto } from './dto/group.dto';
import { plainToClass } from 'class-transformer';
import { GroupMember } from './entities/group-member.entity';

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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/join')
  async joinGroup(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('groupId', ParseUUIDPipe) groupId: string,
  ): Promise<GroupMember> {
    return await this.groupService.joinGroup(userId, groupId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req): Promise<GroupDto[]> {
    // Throw Forbidden HTTP error if the user is not an admin
    if (!this.groupService.userIsAdmin(req.user.id))
      throw new ForbiddenException();
    return plainToClass(GroupDto, await this.groupService.findAll());
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GroupDto> {
    const user = await this.groupService.findOne(id);
    if (!user)
      throw new NotFoundException(`User with id: '${id}' does not exist`);
    return plainToClass(GroupDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDto> {
    return plainToClass(
      GroupDto,
      await this.groupService.update(id, updateGroupDto),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.groupService.remove(id);
  }
}
