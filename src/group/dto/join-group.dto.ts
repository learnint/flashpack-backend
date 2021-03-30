import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class JoinGroupDto {
  @IsUUID()
  groupId: string;
}
