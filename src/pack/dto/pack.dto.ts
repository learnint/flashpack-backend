import { Exclude, Expose } from 'class-transformer';
import { GroupPackDto } from './group-pack.dto';
import { UserPackDto } from './user-pack.dto';

@Exclude()
export class PackDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  timed: boolean;

  @Expose()
  description: string;

  @Expose()
  totalTime: number;

  @Expose()
  liveResults: boolean;

  @Expose()
  groupPack: GroupPackDto;

  @Expose()
  userPack: UserPackDto;

  @Expose()
  cardCount: number;
}
