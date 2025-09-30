/**
 * Reports Controller
 *
 * Following SOLID principles:
 * - Single Responsibility: Handles only report HTTP requests
 * - Open/Closed: Extensible for new report endpoints
 * - Interface Segregation: Focused on report API
 * - Dependency Inversion: Depends on abstract service
 */

import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReportsService, DailyReportFilter } from './reports.service';
import { IsString, IsDateString, IsOptional } from 'class-validator';

class DailyReportQueryDto implements DailyReportFilter {
  @IsString()
  store_id: string;

  @IsDateString()
  date_from: string;

  @IsDateString()
  date_to: string;
}

class ExportReportQueryDto extends DailyReportQueryDto {
  @IsOptional()
  @IsString()
  format?: 'excel' | 'pdf' | 'csv';
}

@Controller('api/v1/reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Generate daily report with revenue/cost breakdown
   *
   * @param query Report filter parameters
   * @returns Comprehensive daily report data
   */
  @Get('daily')
  @HttpCode(HttpStatus.OK)
  async getDailyReport(@Query() query: DailyReportQueryDto) {
    this.logger.log(
      `Generating daily report for store ${query.store_id} from ${query.date_from} to ${query.date_to}`
    );

    try {
      const report = await this.reportsService.generateDailyReport(query);

      this.logger.log(
        `Daily report generated successfully for store ${query.store_id}`
      );

      return {
        success: true,
        data: report,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate daily report: ${error.message}`,
        error.stack
      );

      return {
        success: false,
        error: 'Failed to generate report',
        message: error.message,
      };
    }
  }

  /**
   * Export daily report in various formats
   *
   * @param query Export parameters including format
   * @returns Report data in requested format
   */
  @Get('daily/export')
  @HttpCode(HttpStatus.OK)
  async exportDailyReport(@Query() query: ExportReportQueryDto) {
    const format = query.format || 'excel';

    this.logger.log(
      `Exporting daily report in ${format} format for store ${query.store_id}`
    );

    try {
      // Generate base report data
      const report = await this.reportsService.generateDailyReport(query);

      // Format response based on requested format
      switch (format) {
        case 'excel':
          return {
            success: true,
            data: report,
            format: 'excel',
            download_url: `/api/v1/reports/download/${report.period.start_date}-${report.period.end_date}.xlsx`,
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          };

        case 'pdf':
          return {
            success: true,
            data: report,
            format: 'pdf',
            download_url: `/api/v1/reports/download/${report.period.start_date}-${report.period.end_date}.pdf`,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          };

        case 'csv':
          return {
            success: true,
            data: this.formatCSVData(report),
            format: 'csv',
            filename: `daily-report-${report.period.start_date}-${report.period.end_date}.csv`,
          };

        default:
          return {
            success: false,
            error: 'Unsupported export format',
            supported_formats: ['excel', 'pdf', 'csv'],
          };
      }
    } catch (error) {
      this.logger.error(
        `Failed to export daily report: ${error.message}`,
        error.stack
      );

      return {
        success: false,
        error: 'Failed to export report',
        message: error.message,
      };
    }
  }

  /**
   * Get quick summary statistics
   *
   * @param query Basic filter parameters
   * @returns Summary statistics only
   */
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getReportSummary(@Query() query: DailyReportQueryDto) {
    this.logger.log(`Generating report summary for store ${query.store_id}`);

    try {
      const report = await this.reportsService.generateDailyReport(query);

      return {
        success: true,
        data: {
          period: report.period,
          summary: report.summary,
          top_performers: report.beautician_performance.slice(0, 3),
        },
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate report summary: ${error.message}`,
        error.stack
      );

      return {
        success: false,
        error: 'Failed to generate summary',
        message: error.message,
      };
    }
  }

  /**
   * Format report data for CSV export (KISS principle)
   */
  private formatCSVData(report: any) {
    const csvData = {
      summary: [
        ['Period', `${report.period.start_date} to ${report.period.end_date}`],
        ['Total Days', report.period.total_days],
        ['Total Revenue', report.summary.revenue.total_gross],
        ['Total Costs', report.summary.costs.total_amount],
        ['Net Profit', report.summary.profit.net_profit],
        ['Profit Margin', `${report.summary.profit.profit_margin.toFixed(2)}%`],
      ],
      daily_breakdown: report.daily_breakdown.map((day: any) => [
        day.date,
        day.revenue.total_gross,
        day.revenue.session_count,
        day.costs.total_amount,
        day.profit.net_profit,
      ]),
      beautician_performance: report.beautician_performance.map(
        (beautician: any) => [
          beautician.beautician_name,
          beautician.total_revenue,
          beautician.session_count,
          beautician.total_share,
        ]
      ),
    };

    return csvData;
  }
}
