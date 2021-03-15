import { Exclude, Expose } from 'class-transformer';
import { GroupDto } from 'src/group/dto/group.dto';

@Exclude()
export class GroupPackDto {
  @Expose()
  id: string;
  @Expose()
  group: GroupDto;
}
