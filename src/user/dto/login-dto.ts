import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@Exclude()
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;
  @IsNotEmpty()
  @Length(0, 30)
  @Expose()
  password: string;
}
