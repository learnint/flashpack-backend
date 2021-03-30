import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

@Exclude()
export class CreateGroupDto {
  @IsNotEmpty()
  @Length(3, 20)
  @Expose()
  name: string;

  @Length(0, 500)
  @Expose()
  @IsOptional()
  description: string;

  @IsOptional()
  @Expose()
  tags: string[];
}
