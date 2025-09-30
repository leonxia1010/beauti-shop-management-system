import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExceptionType,
  ExceptionSeverity,
  ExceptionRecord,
} from '@prisma/client';
import { CreateServiceSessionDto } from '../revenue/dto';
import { CreateCostEntryDto } from '../costs/dto';

export interface ValidationRule<T = unknown> {
  name: string;
  description: string;
  validator: (data: T) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  exceptions: ExceptionInfo[];
}

export interface ExceptionInfo {
  type: ExceptionType;
  severity: ExceptionSeverity;
  message: string;
  fieldName?: string;
  fieldValue?: string;
  ruleName: string;
}

@Injectable()
export class ExceptionDetectionService {
  private readonly logger = new Logger(ExceptionDetectionService.name);
  private readonly revenueRules: ValidationRule<CreateServiceSessionDto>[] = [];
  private readonly costRules: ValidationRule<CreateCostEntryDto>[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.initializeValidationRules();
  }

  /**
   * Initialize all validation rules
   */
  private initializeValidationRules() {
    // Revenue validation rules
    this.revenueRules.push(
      {
        name: 'positive_amount',
        description: 'Revenue amount must be positive',
        validator: (data: CreateServiceSessionDto) => {
          const exceptions: ExceptionInfo[] = [];
          if (data.gross_revenue <= 0) {
            exceptions.push({
              type: ExceptionType.VALIDATION_ERROR,
              severity: ExceptionSeverity.HIGH,
              message: 'Revenue amount must be positive',
              fieldName: 'gross_revenue',
              fieldValue: data.gross_revenue.toString(),
              ruleName: 'positive_amount',
            });
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      },
      {
        name: 'future_date_check',
        description: 'Service date cannot be in the future',
        validator: (data: CreateServiceSessionDto) => {
          const exceptions: ExceptionInfo[] = [];
          const serviceDate = new Date(data.service_date);
          const today = new Date();
          today.setHours(23, 59, 59, 999);

          if (serviceDate > today) {
            exceptions.push({
              type: ExceptionType.BUSINESS_RULE_VIOLATION,
              severity: ExceptionSeverity.MEDIUM,
              message: 'Service date cannot be in the future',
              fieldName: 'service_date',
              fieldValue: data.service_date,
              ruleName: 'future_date_check',
            });
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      },
      {
        name: 'unusual_high_amount',
        description: 'Revenue amount seems unusually high',
        validator: (data: CreateServiceSessionDto) => {
          const exceptions: ExceptionInfo[] = [];
          if (data.gross_revenue > 5000) {
            exceptions.push({
              type: ExceptionType.DATA_ANOMALY,
              severity: ExceptionSeverity.MEDIUM,
              message: `Revenue amount ${data.gross_revenue} seems unusually high`,
              fieldName: 'gross_revenue',
              fieldValue: data.gross_revenue.toString(),
              ruleName: 'unusual_high_amount',
            });
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      },
      {
        name: 'weekend_high_activity',
        description: 'High revenue activity on weekends',
        validator: (data: CreateServiceSessionDto) => {
          const exceptions: ExceptionInfo[] = [];
          const serviceDate = new Date(data.service_date);
          const dayOfWeek = serviceDate.getDay();

          // Weekend = Saturday (6) or Sunday (0)
          if (
            (dayOfWeek === 0 || dayOfWeek === 6) &&
            data.gross_revenue > 2000
          ) {
            exceptions.push({
              type: ExceptionType.SUSPICIOUS_ACTIVITY,
              severity: ExceptionSeverity.LOW,
              message: `High revenue ${data.gross_revenue} on weekend`,
              fieldName: 'gross_revenue',
              fieldValue: data.gross_revenue.toString(),
              ruleName: 'weekend_high_activity',
            });
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      }
    );

    // Cost validation rules
    this.costRules.push(
      {
        name: 'positive_cost_amount',
        description: 'Cost amount must be positive',
        validator: (data: CreateCostEntryDto) => {
          const exceptions: ExceptionInfo[] = [];
          if (data.amount <= 0) {
            exceptions.push({
              type: ExceptionType.VALIDATION_ERROR,
              severity: ExceptionSeverity.HIGH,
              message: 'Cost amount must be positive',
              fieldName: 'amount',
              fieldValue: data.amount.toString(),
              ruleName: 'positive_cost_amount',
            });
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      },
      {
        name: 'unusual_high_cost',
        description: 'Cost amount seems unusually high',
        validator: (data: CreateCostEntryDto) => {
          const exceptions: ExceptionInfo[] = [];
          if (data.amount > 50000) {
            exceptions.push({
              type: ExceptionType.DATA_ANOMALY,
              severity: ExceptionSeverity.MEDIUM,
              message: `Cost amount ${data.amount} seems unusually high`,
              fieldName: 'amount',
              fieldValue: data.amount.toString(),
              ruleName: 'unusual_high_cost',
            });
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      },
      {
        name: 'required_fields_check',
        description: 'All required fields must be present',
        validator: (data: CreateCostEntryDto) => {
          const exceptions: ExceptionInfo[] = [];
          const requiredFields = ['store_id', 'category', 'payer', 'amount'];

          for (const field of requiredFields) {
            if (
              !data[field] ||
              (typeof data[field] === 'string' && data[field].trim() === '')
            ) {
              exceptions.push({
                type: ExceptionType.VALIDATION_ERROR,
                severity: ExceptionSeverity.HIGH,
                message: `Required field '${field}' is missing or empty`,
                fieldName: field,
                fieldValue: data[field]?.toString() || '',
                ruleName: 'required_fields_check',
              });
            }
          }
          return { isValid: exceptions.length === 0, exceptions };
        },
      }
    );
  }

  /**
   * Validate revenue data and detect exceptions
   */
  async validateRevenueData(
    data: CreateServiceSessionDto,
    recordId?: string
  ): Promise<ValidationResult> {
    return this.runValidationRules(
      'service_sessions',
      this.revenueRules,
      data,
      recordId
    );
  }

  /**
   * Validate cost data and detect exceptions
   */
  async validateCostData(
    data: CreateCostEntryDto,
    recordId?: string
  ): Promise<ValidationResult> {
    return this.runValidationRules(
      'cost_entries',
      this.costRules,
      data,
      recordId
    );
  }

  /**
   * Run validation rules and store exceptions
   */
  /**
   * Run validation rules against data
   * @param data - Uses `any` to accept various DTO types without index signature
   */
  private async runValidationRules(
    tableName: string,
    rules: ValidationRule[],
    data: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    recordId?: string
  ): Promise<ValidationResult> {
    const allExceptions: ExceptionInfo[] = [];

    // Run all validation rules
    for (const rule of rules) {
      try {
        const result = rule.validator(data);
        allExceptions.push(...result.exceptions);
      } catch (error) {
        this.logger.error(
          `Error running validation rule ${rule.name}: ${error.message}`
        );
        allExceptions.push({
          type: ExceptionType.VALIDATION_ERROR,
          severity: ExceptionSeverity.CRITICAL,
          message: `Validation rule error: ${error.message}`,
          ruleName: rule.name,
        });
      }
    }

    // Store exceptions in database if recordId is provided
    if (recordId && allExceptions.length > 0) {
      await this.storeExceptions(
        tableName,
        recordId,
        allExceptions,
        data.store_id
      );
    }

    return {
      isValid: allExceptions.length === 0,
      exceptions: allExceptions,
    };
  }

  /**
   * Store exceptions in database
   */
  private async storeExceptions(
    tableName: string,
    recordId: string,
    exceptions: ExceptionInfo[],
    storeId: string
  ): Promise<void> {
    try {
      const exceptionRecords = exceptions.map((exception) => ({
        table_name: tableName,
        record_id: recordId,
        exception_type: exception.type,
        severity: exception.severity,
        message: exception.message,
        field_name: exception.fieldName,
        field_value: exception.fieldValue,
        rule_name: exception.ruleName,
        store_id: storeId,
      }));

      await this.prisma.exceptionRecord.createMany({
        data: exceptionRecords,
      });

      this.logger.log(
        `Stored ${exceptions.length} exceptions for ${tableName}:${recordId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to store exceptions: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Get exception records with filtering
   */
  async getExceptions(params: {
    store_id: string;
    table_name?: string;
    severity?: ExceptionSeverity;
    resolved?: boolean;
    limit?: number;
    cursor?: string;
  }) {
    const {
      store_id,
      table_name,
      severity,
      resolved,
      limit = 50,
      cursor,
    } = params;

    const where = {
      store_id,
      ...(table_name && { table_name }),
      ...(severity && { severity }),
      ...(resolved !== undefined && { resolved }),
    };

    const exceptions = await this.prisma.exceptionRecord.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const total = await this.prisma.exceptionRecord.count({ where });
    const nextCursor =
      exceptions.length === limit ? exceptions[exceptions.length - 1].id : null;

    return {
      data: exceptions,
      pagination: {
        total,
        limit,
        cursor: nextCursor,
        hasMore: exceptions.length === limit,
      },
    };
  }

  /**
   * Resolve an exception
   */
  async resolveException(
    id: string,
    resolvedBy: string
  ): Promise<ExceptionRecord> {
    return this.prisma.exceptionRecord.update({
      where: { id },
      data: {
        resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get exception statistics
   */
  async getExceptionStats(storeId: string) {
    const [total, unresolved, bySeverity, byType] = await Promise.all([
      this.prisma.exceptionRecord.count({
        where: { store_id: storeId },
      }),
      this.prisma.exceptionRecord.count({
        where: { store_id: storeId, resolved: false },
      }),
      this.prisma.exceptionRecord.groupBy({
        by: ['severity'],
        where: { store_id: storeId, resolved: false },
        _count: { severity: true },
      }),
      this.prisma.exceptionRecord.groupBy({
        by: ['exception_type'],
        where: { store_id: storeId, resolved: false },
        _count: { exception_type: true },
      }),
    ]);

    return {
      total,
      unresolved,
      resolved: total - unresolved,
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count.severity;
        return acc;
      }, {} as Record<string, number>),
      byType: byType.reduce((acc, item) => {
        acc[item.exception_type] = item._count.exception_type;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
