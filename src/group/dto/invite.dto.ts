import { IsArray } from "class-validator";

export class InviteDto {
  @IsArray()
  emails: string[];
}
