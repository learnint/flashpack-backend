import { User } from 'src/user/entities/user.entity';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class GroupAdmin extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', name: 'groupId' })
  @ManyToOne(() => Group, (group) => group.groupMembers, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  group: Group;

  @PrimaryColumn({ type: 'uuid', name: 'userId' })
  @ManyToOne(() => User, (user) => user.groupMembers, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;
}
