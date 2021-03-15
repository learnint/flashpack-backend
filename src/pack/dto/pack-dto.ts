import { Exclude, Expose } from 'class-transformer';
import { GroupPackDto } from './group-pack.dto';
import { UserPackDto } from './user-pack.dto';

@Exclude()
export class PackDto {
  @Expose()
  readonly id: string;

  @Expose()
  readonly name: string;

  @Expose()
  readonly timed: boolean;

  @Expose()
  readonly liveResults: boolean;

  @Expose()
  readonly groupPack: GroupPackDto;

  @Expose()
  readonly userPack: UserPackDto;
}
