import { Group } from 'src/group/entities/group.entity';
import { StringUtil } from 'src/util/string.util';
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
export class GroupPack extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToOne(() => Pack, (pack) => pack.groupPack, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  pack: Pack;
  
  @ManyToOne(() => Group, (group) => group.groupPacks, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  group: Group;
}
