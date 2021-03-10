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
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Group } from './entities/group.entity';
import { GroupDto } from './dto/group.dto';
import { plainToClass } from 'class-transformer';

@Controller('/api/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

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
  @Get()
  async findAll(@Req() req): Promise<GroupDto[]> {
    const groups: Group[] = await this.groupService.findAll();
    return plainToClass(GroupDto, groups);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.groupService.findOne(+id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
  //   return this.groupService.update(+id, updateGroupDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.groupService.remove(+id);
  // }
}
