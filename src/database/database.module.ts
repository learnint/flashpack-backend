import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/group/entities/group.entity';
import { User } from 'src/user/entities/user.entity';
import { rootCertificates } from 'tls';

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
      entities: [User, Group],
    }),
  ],
})
export class DatabaseModule {}
