import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CardType } from '../constants';

@Exclude()
export class UpdateCardDto {
  @IsOptional()
  @IsEnum(CardType)
  @Expose()
  type: CardType;

  @IsOptional()
  @Length(5, 1000)
  @Expose()
  question: string;

  @IsOptional()
  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCardOptionDto)
  options: UpdateCardOptionDto[];
}
@Exclude()
export class UpdateCardOptionDto {
  @Expose()
  @Length(1, 200)
  text: string;

  @Expose()
  @IsBoolean()
  isCorrect: boolean;

  @Expose()
  @IsNotEmpty()
  order: number;
}
