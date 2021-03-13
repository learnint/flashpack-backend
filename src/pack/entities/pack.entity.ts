import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
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

  @OneToOne(() => GroupPack, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  groupPack: GroupPack;

  @OneToOne(() => UserPack, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  userPack: UserPack;
}
