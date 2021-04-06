import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID, Length } from 'class-validator';
import { UserDto } from 'src/user/dto/user.dto';
import { GroupUserDto } from './group-user.dto';

@Exclude()
export class GroupDto {
  @IsUUID()
  @Expose()
  id: string;
  @Expose()
  @IsNotEmpty()
  @Length(3, 20)
  name: string;
  @Expose()
  createdDate: Date;
  @Expose()
  createdByName: string;
  @Expose()
  createdByUserId: string;
  @Expose()
  @Length(0, 500)
  description: string;
  @Expose()
  tags: string[];
  @Expose()
  users: GroupUserDto[];
  @Expose()
  memberCount: number;
  @Expose()
  isJoined: boolean;
  @Expose()
  isAdmin: boolean;
  @Expose()
  packCount: number;
}
