import { Exclude, Expose } from "class-transformer";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class GroupUserDto extends UserDto {
  @Expose()
  isJoined: boolean;
}
