import { IsEmail, IsNotEmpty } from 'class-validator';
export class UserDto {
  @IsNotEmpty()
  readonly firstName: string;
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  readonly isAdmin: boolean;

}
