
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
   liveResults: boolean;

  @Expose()
   groupPack: GroupPackDto;

  @Expose()
   userPack: UserPackDto;
}