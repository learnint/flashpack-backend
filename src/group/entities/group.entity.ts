import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  Generated,
  CreateDateColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { GroupMember } from './group-member.entity';
import { GroupPack } from 'src/pack/entities/group-pack.entity';
import { StringUtil } from 'src/util/string.util';

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdDate: Date;

  @Column()
  createdByName: string;

  @Column()
  link: string;

  @ManyToOne(() => User, (user) => user.groups, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  createdByUser: User;

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group)
  groupMembers: GroupMember[];

  @OneToMany(() => GroupPack, (groupPack) => groupPack.group)
  groupPacks: GroupPack[];

  // @AfterLoad()
  // private async loadTempPassword(): Promise<void> {
  //   this.tempPass = this.password;
  // }


  // Take the supplied password and hash + salt it
  // @BeforeUpdate()
  // @BeforeInsert()
  // async hashPassword() {
  //   const saltRounds = 10;
  //   if (this.tempPass !== this.password)
  //     this.password = this.password
  //     ? await bcrypt.hash(this.password, saltRounds)
  //     : this.password;
  // }

  @BeforeInsert()
  @BeforeUpdate()
  setName() {
    const stringUtil = new StringUtil();
    this.name = this.name ? stringUtil.makeName(this.name) : this.name;
  }
}
