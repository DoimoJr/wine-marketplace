import { Module } from '@nestjs/common';
import { NexiController } from './nexi.controller';
import { NexiService } from './nexi.service';

@Module({
  controllers: [NexiController],
  providers: [NexiService],
  exports: [NexiService],
})
export class NexiModule {}