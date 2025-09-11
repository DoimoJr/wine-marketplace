import { Module } from '@nestjs/common';
import { WinesController } from './wines.controller';
import { WinesService } from './wines.service';

@Module({
  controllers: [WinesController],
  providers: [WinesService],
  exports: [WinesService],
})
export class WinesModule {}