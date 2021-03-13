import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Group } from 'src/group/entities/group.entity';
import { GroupMember } from 'src/group/entities/group-member.entity';
import { StringUtil } from 'src/util/string.util';

@Entity()
export class User extends BaseEntity {
  // constructor(private readonly stringUtil: StringUtil) {
  //   super();
  // }
  
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

  @OneToMany(() => Group, (group) => group.createdByUser)
  groups: Group[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  groupMembers: GroupMember[];

  // Take the supplied password and hash + salt it
  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  @BeforeInsert()
  setAdmin() {
    this.isAdmin = false;
  }

  @BeforeInsert()
  setName() {
    const stringUtil = new StringUtil();

    this.firstName =  stringUtil.makeName(this.firstName);
    this.lastName = stringUtil.makeName(this.lastName);
    this.email = this.email.toLowerCase().trim();
  }

}
