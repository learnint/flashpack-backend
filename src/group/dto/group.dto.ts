import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

@Exclude()
export class GroupDto {
  @IsUUID()
  @Expose()
  id: string;
  @Expose()
  @IsNotEmpty()
  name: string;
  @Expose()
  createdDate: Date;
  @Expose()
  createdByName: string;
  @Expose()
  link: string;
  @Expose()
  description: string;
  @Expose()
  tags: string[];
}
