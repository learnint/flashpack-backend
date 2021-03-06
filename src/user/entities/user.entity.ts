import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Group } from 'src/group/entities/group.entity';
import { GroupMember } from 'src/group/entities/group-member.entity';
import { StringUtil } from 'src/util/string.util';
import { UserPack } from 'src/pack/entities/user-pack.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('boolean', { nullable: true })
  isAdmin: boolean;

  private tempPass: String;

  @OneToMany(() => Group, (group) => group.createdByUser)
  groups: Group[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  groupMembers: GroupMember[];

  @OneToMany(() => UserPack, (userPack) => userPack.user)
  userPacks: UserPack[];

  @AfterLoad()
  private async loadTempPassword(): Promise<void> {
    this.tempPass = this.password;
  }

  // Take the supplied password and hash + salt it
  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 10;
    if (this.tempPass !== this.password)
      this.password = this.password ? await bcrypt.hash(this.password, saltRounds): this.password;
  }

  @BeforeInsert()
  setAdmin() {
    this.isAdmin = false;
  }

  @BeforeInsert()
  @BeforeUpdate()
  setName() {
    const stringUtil = new StringUtil();

    this.firstName = this.firstName
      ? stringUtil.makeName(this.firstName)
      : this.firstName;
    this.lastName = this.lastName
      ? stringUtil.makeName(this.lastName)
      : this.lastName;
    this.email = this.email ? this.email.toLowerCase().trim() : this.email;
  }
}
