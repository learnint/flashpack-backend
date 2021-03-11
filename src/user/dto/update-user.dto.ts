import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

@Exclude()
export class UpdateUserDto {
  @IsNotEmpty()
  @Expose()
  readonly firstName: string;

  @IsNotEmpty()
  @Expose()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @Expose()
  readonly email: string;

  @IsOptional()
  @Length(6, 30)
  @Expose()
  readonly password: string;
}
