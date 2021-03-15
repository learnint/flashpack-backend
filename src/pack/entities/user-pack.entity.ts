import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pack } from './pack.entity';

@Entity()
export class UserPack extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Pack, (pack) => pack.userPack, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  pack: Pack;

  @ManyToOne(() => User, (user) => user.userPacks, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;
}
