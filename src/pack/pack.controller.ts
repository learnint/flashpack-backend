import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  Req,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PackService } from './pack.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Pack } from './entities/pack.entity';
import { PackDto } from './dto/pack.dto';
import { plainToClass } from 'class-transformer';
import { CreateUserPackDto } from './dto/create-user-pack.dto';
import { CreateGroupPackDto } from './dto/create-group-pack.dto';
import { PackType, PackTypeInclusive } from './constants';
import { UpdatePackDto } from './dto/update-pack.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { GroupDto } from 'src/group/dto/group.dto';

@ApiTags('pack')
@Controller('packs')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new Pack', type: Pack })
  @ApiConflictResponse({ description: 'Duplicate group name' })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/groupPack')
  async createGroupPack(
    @Body() createPackDto: CreateGroupPackDto,
    @Req() req,
  ): Promise<PackDto> {
    await this.packService.checkForbiddenOnCreate(
      req.user.id,
      createPackDto.groupId,
      PackType.Group,
    );
    return await this.packService.createGroupPack(createPackDto);
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new Pack', type: Pack })
  @ApiConflictResponse({ description: 'Duplicate group name' })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/userPack')
  async createUserPack(
    @Body() createPackDto: CreateUserPackDto,
    @Req() req,
  ): Promise<PackDto> {
    if (!createPackDto.userId) createPackDto.userId = req.user.id;
    await this.packService.checkForbiddenOnCreate(
      req.user.id,
      createPackDto.userId,
      PackType.User,
    );
    return await this.packService.createUserPack(createPackDto);
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'type', enum: PackTypeInclusive })
  @Get()
  async findAll(
    @Query('type') type: PackTypeInclusive = PackTypeInclusive.Both,
    @Req() req,
  ): Promise<PackDto[]> {
    let packsFiltered = await this.packService.findAll();
    if (!(await this.packService.userIsAdmin(req.user.id)))
      throw new ForbiddenException();
    switch (type) {
      case PackTypeInclusive.Both:
        packsFiltered = packsFiltered.sort();
        break;
      case PackTypeInclusive.Group:
        packsFiltered = packsFiltered.filter((x) => x.groupPack).sort();
        break;
      case PackTypeInclusive.User:
        packsFiltered = packsFiltered.filter((x) => x.userPack).sort();
        break;
    }
    return await this.packService.createPacksDto(packsFiltered);
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'type', enum: PackType })
  @UseGuards(AuthGuard('jwt'))
  @Get('/type/:id')
  async findAllForUserOrGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('type') type: PackType,
    @Req() req,
  ) {
    const packs = await this.packService.findAllForUserOrGroup(id, type);
    if (!packs || packs.length === 0)
      throw new NotFoundException(`ID: '${id}' not found for type: '${type}'`);
    await this.packService.checkForbidden(req.user.id, packs[0]);
    return await this.packService.createPacksDto(packs);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<PackDto> {
    const pack = await this.packService.findOne(id);
    if (!pack) throw new NotFoundException(`Pack ID: '${id}' not found`);

    // check if forbidden
    await this.packService.checkForbidden(req.user.id, pack);

    return await this.packService.createPackDto(pack);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackDto: UpdatePackDto,
    @Req() req,
  ): Promise<PackDto> {

    const pack = await this.packService.findOne(id);
    if (!pack) throw new NotFoundException(`Pack with ID: '${id}' not found`);
    //check forbidden
    await this.packService.checkForbidden(req.user.id, pack, false);

    const dto = await this.packService.createPackDto(
      await this.packService.update(id, updatePackDto),
    );
    return dto;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const packDto = await this.packService.findOne(id);
    if (!packDto)
      throw new NotFoundException(`Pack with ID: '${id}' not found`);
    //check if forbidden should be thrown
    await this.packService.checkForbidden(req.user.id, packDto, false);
    return await this.packService.remove(packDto);
  }
}
