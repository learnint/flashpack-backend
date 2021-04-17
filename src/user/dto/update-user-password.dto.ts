import { Exclude, Expose } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';

@Exclude()
export class UpdateUserPasswordDto {
  @Length(6, 30)
  @Expose()
  oldPassword: string;

  @Length(6, 30)
  @Expose()
  readonly newPassword: string;
}
