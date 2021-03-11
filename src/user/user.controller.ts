import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  UseGuards,
  Req,
  ForbiddenException,
  ParseUUIDPipe,
  Patch,
  ParseBoolPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { plainToClass } from 'class-transformer';

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return plainToClass(UserDto, await this.userService.create(createUserDto));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req): Promise<UserDto[]> {
    // Throw Forbidden HTTP error if the user is not an admin
    if (!this.userService.isAdmin(req.user.id)) throw new ForbiddenException();
    return plainToClass(UserDto, await this.userService.findAll());
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return plainToClass(UserDto, await this.userService.findOne(id));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return plainToClass(
      UserDto,
      await this.userService.update(id, updateUserDto),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async makeAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('makeAdmin', ParseBoolPipe) makeAdmin: boolean,
    @Req() req,
  ): Promise<UserDto> {
    // Throw Forbidden HTTP error if the user is not an admin
    if (!this.userService.isAdmin(req.user.id)) throw new ForbiddenException();
    return plainToClass(
      UserDto,
      await this.userService.makeAdmin(id, makeAdmin),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.remove(id);
  }
}
