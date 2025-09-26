import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

interface AuditLogData {
  table_name: string;
  record_id: string;
  action: AuditAction;
  old_values?: any;
  new_values?: any;
  changed_by: string;
  request_id?: string;
  store_id: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an action to the audit trail
   */
  async logAction(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          ...data,
          timestamp: new Date(),
        },
      });

      this.logger.debug(
        `Logged ${data.action} action for ${data.table_name}:${data.record_id} by ${data.changed_by}`
      );
    } catch (error) {
      // Don't let audit failures break the main operation
      this.logger.error(
        `Failed to log audit action: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Get audit trail for a specific record
   */
  async getAuditTrail(table_name: string, record_id: string) {
    return this.prisma.auditLog.findMany({
      where: {
        table_name,
        record_id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get audit trail for a store (for store-scoped access)
   */
  async getStoreAuditTrail(store_id: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: {
        store_id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}
