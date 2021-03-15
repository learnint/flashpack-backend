import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';

@Exclude()
export class UpdateGroupDto {
  @IsNotEmpty()
  @Length(3, 20)
  @Expose()
  name: string;

  @Length(6, 30)
  @IsOptional()
  @Expose()
  password: string;

  @Length(6, 30)
  @IsOptional()
  @Expose()
  newPassword: string;

  @Length(0, 500)
  @Expose()
  @IsOptional()
  description: string;

  @IsOptional()
  tags: string[];
}
