import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
      type: 'postgres' as 'postgres',
      host: configService.get('DATABASE_HOST','localhost'),
      port: configService.get<number>('DATABASE_PORT', 5432),
      username: configService.get('DATABASE_USER', 'postgres'),
      password: configService.get('DATABASE_PASS'),
      database: configService.get('DATABASE_SCHEMA','flashPack'),
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
      }) as TypeOrmModuleOptions
    }),
  ],
})
export class DatabaseModule {}
