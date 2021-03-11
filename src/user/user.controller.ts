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
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { plainToClass } from 'class-transformer';
import { User } from './entities/user.entity';

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new User Account', type: User })
  @ApiConflictResponse({
    description: 'Conflict with email, it is already in use',
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return plainToClass(UserDto, await this.userService.create(createUserDto));
  }

  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req): Promise<UserDto[]> {
    // Throw Forbidden HTTP error if the user is not an admin;
    if ((await this.userService.isAdmin(req.user.id)) === false) {
      console.log('here');
      throw new ForbiddenException();
    }
    return plainToClass(UserDto, await this.userService.findAll());
  }

  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiNotFoundResponse({ description: 'ID not found' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return plainToClass(UserDto, await this.userService.findOne(id));
  }

  @ApiOkResponse({ description: 'Successfully updated User', type: User })
  @ApiConflictResponse({
    description: 'Conflict. Existing account with the email',
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
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return plainToClass(
      UserDto,
      await this.userService.update(id, updateUserDto),
    );
  }

  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiOkResponse({
    description: 'Successfully updated user admin status',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiNotFoundResponse({ description: 'ID not found' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async makeAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('makeAdmin', ParseBoolPipe) makeAdmin: boolean,
    @Req() req,
  ): Promise<UserDto> {
    // Throw Forbidden HTTP error if the user is not an admin
    const d = await this.userService.isAdmin(req.user.id);
    console.log(d);
    if ((await this.userService.isAdmin(req.user.id)) === false)
      throw new ForbiddenException();
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
