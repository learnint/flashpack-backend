import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { PackModule } from './pack/pack.module';
import { StringUtil } from './util/string.util';
import { CardModule } from './card/card.module';
import { ConfigModule } from '@nestjs/config';
import { isRgbColor } from 'class-validator';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    AuthModule,
    GroupModule,
    PackModule,
    CardModule,
  ],
  controllers: [AppController],
  providers: [AppService, StringUtil],
})
export class AppModule {}
