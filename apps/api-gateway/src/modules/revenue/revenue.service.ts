import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExceptionDetectionService } from '../exception-detection/exception-detection.service';
import {
  CreateServiceSessionDto,
  UpdateServiceSessionDto,
  ServiceSessionFilterDto,
} from './dto';
import { ServiceSession, Prisma } from '@prisma/client';

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptionDetectionService: ExceptionDetectionService
  ) {}

  /**
   * Create a single service session record
   */
  async createSession(data: CreateServiceSessionDto): Promise<ServiceSession> {
    const sessionData = {
      ...data,
      // Apply business rules for beautician share calculation
      ...this.calculateBeauticianShares(data.gross_revenue),
      entry_channel: 'manual_entry',
    };

    const session = await this.prisma.serviceSession.create({
      data: sessionData,
    });

    // Run exception detection after creation
    await this.exceptionDetectionService.validateRevenueData(data, session.id);

    this.logger.log(
      `Created service session ${session.id} for store ${session.store_id}`
    );

    return session;
  }

  /**
   * Get paginated service sessions with filtering
   */
  async getSessions(filter: ServiceSessionFilterDto) {
    const {
      store_id,
      date_from,
      date_to,
      limit = 50,
      cursor,
      beautician_id,
    } = filter;

    const where: Prisma.ServiceSessionWhereInput = {
      store_id,
      ...(beautician_id && { beautician_id }),
      ...(date_from &&
        date_to && {
          service_date: {
            gte: new Date(date_from),
            lte: new Date(date_to),
          },
        }),
    };

    const sessions = await this.prisma.serviceSession.findMany({
      where,
      orderBy: {
        service_date: 'desc',
      },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Get next cursor for pagination
    const nextCursor =
      sessions.length === limit ? sessions[sessions.length - 1].id : null;

    // Get total count for metadata
    const total = await this.prisma.serviceSession.count({ where });

    return {
      data: sessions,
      pagination: {
        total,
        limit,
        cursor: nextCursor,
        hasMore: sessions.length === limit,
      },
    };
  }

  /**
   * Update an existing service session
   */
  async updateSession(
    id: string,
    data: UpdateServiceSessionDto
  ): Promise<ServiceSession> {
    // Recalculate shares if gross_revenue is updated
    const updateData = data.gross_revenue
      ? { ...data, ...this.calculateBeauticianShares(data.gross_revenue) }
      : data;

    const session = await this.prisma.serviceSession.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated service session ${session.id}`);

    return session;
  }

  /**
   * Get single service session by ID
   */
  async getSessionById(id: string): Promise<ServiceSession> {
    return this.prisma.serviceSession.findUnique({
      where: { id },
    });
  }

  /**
   * Business rule engine: Calculate beautician shares based on 4/6 split
   * Beautician gets 60% of gross revenue, store gets 40%
   */
  private calculateBeauticianShares(grossRevenue: number) {
    const beauticianShare = Math.round(grossRevenue * 0.6 * 100) / 100; // 60%
    const netRevenue = Math.round((grossRevenue - beauticianShare) * 100) / 100; // 40%

    return {
      beautician_share: beauticianShare,
      subsidy: 0, // Default subsidy, can be overridden
      net_revenue: netRevenue,
    };
  }

  /**
   * Bulk import service sessions from CSV/Excel data
   */
  async bulkImportSessions(
    sessions: CreateServiceSessionDto[],
    storeId: string
  ) {
    const results = {
      total: sessions.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    };

    // Process sessions in transaction for consistency
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < sessions.length; i++) {
        try {
          const sessionData = {
            ...sessions[i],
            store_id: storeId, // Enforce store scope
            ...this.calculateBeauticianShares(sessions[i].gross_revenue),
            entry_channel: 'bulk_import',
          };

          await tx.serviceSession.create({ data: sessionData });
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: error.message,
            data: sessions[i],
          });
          this.logger.error(
            `Failed to import session at row ${i + 1}: ${error.message}`
          );
        }
      }
    });

    this.logger.log(
      `Bulk import completed: ${results.successful} successful, ${results.failed} failed`
    );

    return results;
  }

  /**
   * Validate and detect exceptions in service session data
   */
  async validateSession(data: CreateServiceSessionDto): Promise<{
    isValid: boolean;
    exceptions: string[];
  }> {
    // Use the new exception detection service
    const result = await this.exceptionDetectionService.validateRevenueData(
      data
    );

    return {
      isValid: result.isValid,
      exceptions: result.exceptions.map((ex) => ex.message),
    };
  }
}
