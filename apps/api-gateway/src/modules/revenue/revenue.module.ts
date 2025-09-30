import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { CsvParserService } from './csv-parser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { ExceptionDetectionModule } from '../exception-detection/exception-detection.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
    PrismaModule,
    AuditModule,
    ExceptionDetectionModule,
  ],
  controllers: [RevenueController],
  providers: [RevenueService, CsvParserService],
  exports: [RevenueService],
})
export class RevenueModule {}
