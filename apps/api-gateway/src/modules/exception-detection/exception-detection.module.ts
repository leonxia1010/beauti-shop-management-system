import { Global, Module } from '@nestjs/common';
import { ExceptionDetectionController } from './exception-detection.controller';
import { ExceptionDetectionService } from './exception-detection.service';

@Global()
@Module({
  controllers: [ExceptionDetectionController],
  providers: [ExceptionDetectionService],
  exports: [ExceptionDetectionService],
})
export class ExceptionDetectionModule {}
