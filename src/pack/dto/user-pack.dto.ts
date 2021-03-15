import { Exclude, Expose } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';

@Exclude()
export class UserPackDto {
  @Expose()
  id: string;
  @Expose()
  user: UserDto;
}
