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
export class CreateCardDto {
  @IsNotEmpty()
  @IsEnum(CardType)
  @Expose()
  type: CardType;

  @Length(10, 1000)
  @Expose()
  question: string;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCardOptionDto)
  options: CreateCardOptionDto[];

  @IsUUID()
  @Expose()
  packId: string;
}

@Exclude()
export class CreateCardOptionDto {
  @Expose()
  @Length(1, 20)
  text: string;

  @Expose()
  @IsBoolean()
  isCorrect: boolean;
}
