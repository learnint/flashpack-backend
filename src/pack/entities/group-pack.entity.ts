import { Group } from 'src/group/entities/group.entity';
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
export class GroupPack extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', name: 'packId' })
  @OneToOne(() => Pack, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  pack: Pack;

  @PrimaryColumn({ type: 'uuid', name: 'groupId' })
  @ManyToOne(() => Group, (group) => group.groupPacks, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  group: Group;
}
