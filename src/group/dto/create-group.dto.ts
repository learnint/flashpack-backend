import { IsNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;

  description: string;
  tags: string[];
}
