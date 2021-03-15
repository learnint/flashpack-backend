import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@Exclude()
export class CreateUserDto {
  @IsNotEmpty()
  @Length(3,30)
  @Expose()
  readonly firstName: string;

  @IsNotEmpty()
  @Length(3,30)
  @Expose()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @Expose()
  readonly email: string;

  @IsNotEmpty()
  @Length(6, 30)
  @Expose()
  readonly password: string;
}
