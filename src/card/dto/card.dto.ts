import { Exclude, Expose, Type } from 'class-transformer';
import { CardType } from '../constants';

@Exclude()
export class CardDto {
  @Expose()
  id: string;

  @Expose()
  type: CardType;

  @Expose()
  question: string;

  @Expose()
  @Type(() => CardOptionDto)
  options: CardOptionDto[];

  @Expose()
  packId: string;
}

@Exclude()
export class CardOptionDto {
  @Expose()
  text: string;
  @Expose()
  isCorrect: boolean;
  @Expose()
  order: number;
}
