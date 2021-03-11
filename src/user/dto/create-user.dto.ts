import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@Exclude()
export class CreateUserDto {
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

  @IsNotEmpty()
  @Length(6, 30)
  @Expose()
  readonly password: string;
}
