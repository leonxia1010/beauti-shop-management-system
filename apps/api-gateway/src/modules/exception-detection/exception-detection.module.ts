import { Global, Module } from '@nestjs/common';
import { ExceptionDetectionController } from './exception-detection.controller';
import { ExceptionDetectionService } from './exception-detection.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [ExceptionDetectionController],
  providers: [ExceptionDetectionService],
  exports: [ExceptionDetectionService],
})
export class ExceptionDetectionModule {}
