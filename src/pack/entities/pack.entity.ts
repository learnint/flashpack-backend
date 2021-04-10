import { Card } from 'src/card/entities/card.entity';
import { StringUtil } from 'src/util/string.util';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupPack } from './group-pack.entity';
import { UserPack } from './user-pack.entity';

@Entity()
export class Pack extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('boolean')
  timed: boolean;

  @Column('boolean')
  liveResults: boolean;

  @Column('int')
  totalTime: number;

  @Column({ nullable: true })
  description?: string;

  @OneToOne(() => GroupPack, (groupPack) => groupPack.pack, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  groupPack: GroupPack;

  @OneToOne(() => UserPack, (userPack) => userPack.pack, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  userPack: UserPack;

  @OneToMany(() => Card, (card) => card.pack)
  cards: Card[];

  @BeforeUpdate()
  @BeforeInsert()
  setDefaults() {
    this.totalTime && this.totalTime >= 300
      ? (this.totalTime = this.totalTime)
      : (this.totalTime = 3600);

    this.liveResults
      ? (this.liveResults = this.liveResults)
      : (this.liveResults = false);

    this.timed ? (this.timed = this.timed) : (this.timed = false);
  }

  @BeforeInsert()
  @BeforeUpdate()
  setName() {
    const stringUtil = new StringUtil();
    this.name = this.name ? stringUtil.makeName(this.name) : this.name;
  }
}
