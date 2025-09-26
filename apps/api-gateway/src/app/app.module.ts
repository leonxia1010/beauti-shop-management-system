import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { AuditModule } from '../modules/audit/audit.module';
import { RevenueModule } from '../modules/revenue/revenue.module';
import { CostsModule } from '../modules/costs/costs.module';
import { ExceptionDetectionModule } from '../modules/exception-detection/exception-detection.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    RevenueModule,
    CostsModule,
    ExceptionDetectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
