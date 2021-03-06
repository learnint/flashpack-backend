import { forwardRef, Module } from '@nestjs/common';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pack } from './entities/pack.entity';
import { UserPack } from './entities/user-pack.entity';
import { GroupPack } from './entities/group-pack.entity';
import { GroupModule } from 'src/group/group.module';
import { UserModule } from 'src/user/user.module';
import { CardModule } from 'src/card/card.module';

@Module({
  controllers: [PackController],
  providers: [PackService],
  imports: [
    TypeOrmModule.forFeature([Pack, UserPack, GroupPack]),
    forwardRef(() => GroupModule),
    forwardRef(() => UserModule),
    forwardRef(() => CardModule),
  ],
  exports: [PackService],
})
export class PackModule {}
