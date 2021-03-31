import { Pack } from 'src/pack/entities/pack.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CardType } from '../constants';
import { CardOption } from './card-options.entity';

@Entity()
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  type: CardType;

  @Column()
  question: string;

  @ManyToOne(() => Pack, (pack) => pack.cards, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  pack: Pack;

  @OneToMany(() => CardOption, (option) => option.card, {
    eager: true,
  })
  options: CardOption[];
}
