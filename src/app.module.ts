import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { PackModule } from './pack/pack.module';
import { StringUtil } from './util/string.util';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, GroupModule, PackModule],
  controllers: [AppController],
  providers: [AppService, StringUtil],
})
export class AppModule {}
