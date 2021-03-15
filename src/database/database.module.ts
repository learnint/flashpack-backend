import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardOption } from 'src/card/entities/card-options.entity';
import { Card } from 'src/card/entities/card.entity';
import { GroupAdmin } from 'src/group/entities/group-admin.entity';
import { GroupMember } from 'src/group/entities/group-member.entity';
import { Group } from 'src/group/entities/group.entity';
import { GroupPack } from 'src/pack/entities/group-pack.entity';
import { Pack } from 'src/pack/entities/pack.entity';
import { UserPack } from 'src/pack/entities/user-pack.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '4l+L58m4',
      database: 'flashPack',
      synchronize: true,
      entities: [
        User,
        Group,
        GroupMember,
        GroupAdmin,
        UserPack,
        Pack,
        GroupPack,
        Card,
        CardOption,
      ],
    }),
  ],
})
export class DatabaseModule {}
