import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID, Length } from 'class-validator';

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
   link: string;
  @Expose()
  @Length(0, 500)
   description: string;
  @Expose()
   tags: string[];
}
