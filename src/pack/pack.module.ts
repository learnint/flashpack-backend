import { Module } from '@nestjs/common';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';

@Module({
  controllers: [PackController],
  providers: [PackService]
})
export class PackModule {}
