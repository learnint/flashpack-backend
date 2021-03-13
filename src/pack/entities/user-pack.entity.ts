import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Pack } from './pack.entity';

@Entity()
export class UserPack extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', name: 'packId' })
  @OneToOne(() => Pack, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  pack: Pack;

  @PrimaryColumn({ type: 'uuid', name: 'userId' })
  @ManyToOne(() => User, (user) => user.userPacks, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: User;
}
