import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardOption } from './entities/card-options.entity';
import { PackModule } from 'src/pack/pack.module';

@Module({
  controllers: [CardController],
  providers: [CardService],
  imports: [TypeOrmModule.forFeature([Card, CardOption]), PackModule],
  exports: [CardService],
})
export class CardModule {}
