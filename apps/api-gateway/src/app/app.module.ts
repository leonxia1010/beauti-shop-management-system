import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { RevenueModule } from '../modules/revenue/revenue.module';

@Module({
  imports: [PrismaModule, RevenueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
