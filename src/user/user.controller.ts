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
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
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
import { UserDto } from './dto/user.dto';
import { plainToClass } from 'class-transformer';
import { User } from './entities/user.entity';
import { StringUtil } from 'src/util/string.util';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@ApiTags('user')
@Controller('/api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('user/whoAmI')
  async whoAmI(@Req() req): Promise<UserDto> {
    return await plainToClass(UserDto, this.userService.findOne(req.user.id));
  }

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new User Account', type: User })
  @ApiConflictResponse({
    description: 'Conflict with email, it is already in use',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID',
  })
  @Post('user')
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
  @Get('users')
  async findAll(@Req() req): Promise<UserDto[]> {
    // Throw Forbidden HTTP error if the user is not an admin;
    if (!(await this.userService.isAdmin(req.user.id)))
      throw new ForbiddenException();

    return plainToClass(UserDto, await this.userService.findAll());
  }

  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiNotFoundResponse({ description: 'ID not found' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'id', required: false })
  @Get('user')
  async findOne(
    @Req() req,
    @Query('id') id: string = undefined,
  ): Promise<UserDto> {
    const stringUtil: StringUtil = new StringUtil();
    if (id && !(await stringUtil.isUUID(id)))
      throw new BadRequestException('Not a UUID');
    const user = plainToClass(
      UserDto,
      await this.userService.findOne(id ? id : req.user.id),
    );
    if (!user) throw new NotFoundException(`User ID: '${id}' not found`);
    return user;
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
  @ApiQuery({ name: 'id', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('user')
  async update(
    @Query('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<UserDto> {
    if (
      id &&
      req.user.id !== id &&
      !(await this.userService.isAdmin(req.user.id))
    )
      throw new ForbiddenException();

    return plainToClass(
      UserDto,
      await this.userService.update(id ? id : req.user.id, updateUserDto),
    );
  }

  @ApiOkResponse({ description: 'Successfully updated User', type: User })
  @ApiConflictResponse({
    description: 'Conflict. Original password does not match records',
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiNotFoundResponse({ description: 'ID not found' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiQuery({ name: 'id', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('user/newPassword')
  async updatePassword(
    @Query('id') id: string,
    @Body() updateUserDto: UpdateUserPasswordDto,
    @Req() req,
  ): Promise<UserDto> {
    if (
      id &&
      req.user.id !== id &&
      !(await this.userService.isAdmin(req.user.id))
    )
      throw new ForbiddenException();

    return plainToClass(
      UserDto,
      await this.userService.updateUserPassword(
        id ? id : req.user.id,
        updateUserDto,
      ),
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
  @Patch('user/:id')
  async makeAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('makeAdmin', ParseBoolPipe) makeAdmin: boolean,
    @Req() req,
  ): Promise<UserDto> {
    // Throw Forbidden HTTP error if the user is not an admin
    if (!(await this.userService.isAdmin(req.user.id)))
      throw new ForbiddenException();
    return plainToClass(
      UserDto,
      await this.userService.makeAdmin(id, makeAdmin),
    );
  }

  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiBadRequestResponse({
    description: 'Invalid UUID',
  })
  @ApiForbiddenResponse({ description: 'User is forbidden' })
  @ApiQuery({ name: 'id', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('user')
  async remove(@Query('id') id: string, @Req() req) {
    if (
      id &&
      req.user.id !== id &&
      !(await this.userService.isAdmin(req.user.id))
    )
      throw new ForbiddenException();
    return await this.userService.remove(id ? id : req.user.id);
  }
}
