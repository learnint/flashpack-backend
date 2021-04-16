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
  Req,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PackService } from './pack.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { PackType } from './constants';
import { UpdatePackDto } from './dto/update-pack.dto';
import { CreatePackDto } from './dto/create-pack.dto';
import { StringUtil } from 'src/util/string.util';

@ApiTags('pack')
@Controller('/api')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new Pack', type: Pack })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('pack')
  async createPack(
    @Body() createPackDto: CreatePackDto,
    @Query('groupId') groupId: string,
    @Req() req,
  ): Promise<PackDto> {
    let retVal;
    const stringUtil: StringUtil = new StringUtil();
    if (groupId && !(await stringUtil.isUUID(groupId)))
      throw new BadRequestException('Validation failed (uuid  is expected)');
    if (groupId) {
      await this.packService.checkForbiddenOnCreate(
        req.user.id,
        groupId,
        PackType.Group,
      );
      retVal = await this.packService.createGroupPack(createPackDto, groupId);
    } else {
      await this.packService.checkForbiddenOnCreate(
        req.user.id,
        req.user.id,
        PackType.User,
      );
      retVal = await this.packService.createUserPack(
        createPackDto,
        req.user.id,
      );
    }
    return retVal;
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'groupId', required: false })
  @Get('packs')
  async findAll(
    @Query('groupId') groupId: string,
    @Req() req,
  ): Promise<PackDto[]> {
    const stringUtil: StringUtil = new StringUtil();
    if (groupId && !(await stringUtil.isUUID(groupId)))
      throw new BadRequestException('Validation failed (uuid is expected)');
    const packs = await this.packService.findAllForUserOrGroup(
      groupId ? groupId : req.user.id,
      groupId ? PackType.Group : PackType.User,
    );
    await this.packService.checkForbidden(
      req.user.id,
      packs[0] || undefined,
      true,
      groupId,
    );
    return await this.packService.createPacksDto(packs);
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'type', enum: PackType })
  @UseGuards(AuthGuard('jwt'))
  @Get('pack/type/:id')
  async findAllForUserOrGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('type') type: PackType,
    @Req() req,
  ) {
    const packs = await this.packService.findAllForUserOrGroup(id, type);
    await this.packService.checkForbidden(req.user.id, packs[0] || undefined);
    return await this.packService.createPacksDto(packs);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('pack/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<PackDto> {
    const pack = await this.packService.findOneWithCards(id);
    if (!pack) throw new NotFoundException(`Pack ID: '${id}' not found`);

    // check if forbidden
    await this.packService.checkForbidden(req.user.id, pack);

    return await this.packService.createPackWithCardsDto(pack);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('pack/:id')
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
  @Delete('pack/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const pack = await this.packService.findOne(id);
    if (!pack) throw new NotFoundException(`Pack with ID: '${id}' not found`);
    //check if forbidden should be thrown
    await this.packService.checkForbidden(req.user.id, pack, false);
    return await this.packService.remove(pack);
  }
}
