import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { CsvParserService } from './csv-parser.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [RevenueController],
  providers: [RevenueService, CsvParserService],
  exports: [RevenueService],
})
export class RevenueModule {}
