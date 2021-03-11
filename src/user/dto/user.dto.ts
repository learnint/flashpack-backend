import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

@Exclude()
export class UserDto {
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  readonly id: string;
  @IsNotEmpty()
  @Expose()
  readonly firstName: string;
  @IsNotEmpty()
  @Expose()
  readonly lastName: string;
  @IsEmail()
  @Expose()
  @IsNotEmpty()
  readonly email: string;
  @Expose()
  @IsBoolean()
  readonly isAdmin: boolean;
}
