import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class JoinGroupDto {
  @IsUUID()
  groupId: string;

  @IsNotEmpty()
  @Length(6, 30)
  password: string;
}
