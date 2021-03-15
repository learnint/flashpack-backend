import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

@Exclude()
export class UpdateUserDto {

  @Length(3,30)
  @IsOptional()
  @Expose()
  readonly firstName: string;

  @IsOptional()
  @Length(3,30)
  @Expose() 
  readonly lastName: string;

  @IsEmail()
  @IsOptional()
  @Expose()
  readonly email: string;

  @IsOptional()
  @Length(6, 30)
  @Expose()
  password: string;

  @IsOptional()
  @Length(6, 30)
  @Expose()
  readonly newPassword: string;
}
