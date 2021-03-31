import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { UserModule } from 'src/user/user.module';
import { GroupMember } from './entities/group-member.entity';
import { GroupAdmin } from './entities/group-admin.entity';
import { PackModule } from 'src/pack/pack.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [
    TypeOrmModule.forFeature([Group, GroupAdmin, GroupMember]),
    forwardRef(() => UserModule),
    forwardRef(() => PackModule),
  ],
  exports: [GroupService],
})
export class GroupModule {}
