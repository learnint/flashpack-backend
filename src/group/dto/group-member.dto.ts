import { Exclude, Expose } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';
import { GroupDto } from './group.dto';
export class GroupMemberDto {
  group: GroupDto;
  user: UserDto;
  isJoined: boolean;
}