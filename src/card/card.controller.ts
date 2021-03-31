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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@ApiTags('card')
@Controller('card')
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
  @Post()
  async create(@Body() createCardDto: CreateCardDto, @Req() req) {
    return await this.cardService.create(createCardDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
