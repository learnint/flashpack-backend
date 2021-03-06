import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Max,
  Min,
} from 'class-validator';

@Exclude()
export class UpdatePackDto {
  @IsNotEmpty()
  @Length(3, 50)
  @Expose()
  name: string;

  @IsOptional()
  @Length(0, 500)
  @Expose()
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Expose()
  timed: boolean;

  @IsOptional()
  @IsNumber()
  @Max(10800)
  @Min(300)
  @Expose()
  totalTime: number;

  @IsBoolean()
  @IsOptional()
  @Expose()
  liveResults: boolean;
}
