import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { runInNewContext } from 'vm';
import { CardService } from './card.service';
import { CardDto } from './dto/card.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@ApiTags('card')
@Controller('api')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiCreatedResponse({ description: 'Created new card', type: Card })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/card')
  async create(
    @Body() createCardDto: CreateCardDto,
    @Req() req,
  ): Promise<CardDto> {
    await this.cardService.checkForbidden(req.user.id, createCardDto.packId);
    return await this.cardService.createCardDto(
      await this.cardService.create(createCardDto),
    );
  }

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiNotFoundResponse({ description: 'Pack not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/cards/pack/:id')
  async findAllForPack(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<CardDto[]> {
    await this.cardService.checkForbidden(req.user.id, id);
    return await this.cardService.createCardsDto(
      await this.cardService.findAllForPack(id),
    );
  }

  @ApiInternalServerErrorResponse({
    description: 'An internal server error occured',
  })
  @ApiBadRequestResponse({
    description: 'Model broken somewhere in the request',
  })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/card/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<CardDto> {
    const card = await this.cardService.findOne(id);
    if (!card)
      throw new NotFoundException(`Card with Id: '${id}' does not exist.`);
    await this.cardService.checkForbidden(req.user.id, card.pack.id);
    return await this.cardService.createCardDto(card);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('/card/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Req() req,
  ): Promise<CardDto> {
    const card = await this.cardService.findOne(id);
    if (!card) throw new NotFoundException(`Card with ID: '${id}' not found`);
    await this.cardService.checkForbidden(req.user.id, card.pack.id);
    return await this.cardService.createCardDto(
      await this.cardService.update(id, updateCardDto),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/card/:id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    const card = await this.cardService.findOne(id);
    if (card) await this.cardService.checkForbidden(req.user.id, card.pack.id);
    return this.cardService.remove(card);
  }
}
