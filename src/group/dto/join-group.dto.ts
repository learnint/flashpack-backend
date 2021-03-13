import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class JoinGroupDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  groupId: string;

  @IsNotEmpty()
  @Length(6, 30)
  password: string;
}
