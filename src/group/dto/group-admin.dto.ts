import { UserDto } from "src/user/dto/user.dto";
import { GroupDto } from "./group.dto";

export class GroupAdminDto {
    group: GroupDto;
    user: UserDto;
  }