import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ExceptionDetectionService } from '../exception-detection/exception-detection.service';
import {
  CreateCostEntryDto,
  UpdateCostEntryDto,
  CostFilterDto,
  CostListResponseDto,
  CostSummaryDto,
} from './dto';
import { CostEntry, Prisma } from '@prisma/client';

@Injectable()
export class CostsService {
  private readonly logger = new Logger(CostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly exceptionDetectionService: ExceptionDetectionService
  ) {}

  /**
   * Create a new cost entry
   */
  async createCostEntry(data: CreateCostEntryDto): Promise<CostEntry> {
    const costEntry = await this.prisma.costEntry.create({
      data,
    });

    // Run exception detection after creation
    await this.exceptionDetectionService.validateCostData(data, costEntry.id);

    // Log the creation in audit trail
    await this.auditService.logAction({
      table_name: 'cost_entries',
      record_id: costEntry.id,
      action: 'CREATE',
      new_values: costEntry,
      changed_by: data.created_by,
      store_id: data.store_id,
    });

    this.logger.log(
      `Created cost entry ${costEntry.id} for store ${costEntry.store_id}`
    );

    return costEntry;
  }

  /**
   * Get paginated cost entries with filtering and summary
   */
  async getCostEntries(filter: CostFilterDto): Promise<CostListResponseDto> {
    const {
      store_id,
      category,
      payer,
      date_from,
      date_to,
      limit = 50,
      cursor,
      allocation_rule_id,
    } = filter;

    const where: Prisma.CostEntryWhereInput = {
      store_id,
      ...(category && {
        category: { contains: category, mode: 'insensitive' },
      }),
      ...(payer && { payer: { contains: payer, mode: 'insensitive' } }),
      ...(allocation_rule_id && { allocation_rule_id }),
      ...(date_from &&
        date_to && {
          created_at: {
            gte: new Date(date_from),
            lte: new Date(date_to),
          },
        }),
    };

    const [costEntries, total] = await Promise.all([
      this.prisma.costEntry.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      }),
      this.prisma.costEntry.count({ where }),
    ]);

    // Generate summary statistics
    const summary = await this.generateCostSummary(where);

    // Get next cursor for pagination
    const nextCursor =
      costEntries.length === limit
        ? costEntries[costEntries.length - 1].id
        : null;

    return {
      data: costEntries,
      pagination: {
        total,
        limit,
        cursor: nextCursor,
        hasMore: costEntries.length === limit,
      },
      summary,
    };
  }

  /**
   * Get a single cost entry by ID
   */
  async getCostEntryById(id: string): Promise<CostEntry> {
    const costEntry = await this.prisma.costEntry.findUnique({
      where: { id },
    });

    if (!costEntry) {
      throw new NotFoundException(`Cost entry with ID ${id} not found`);
    }

    return costEntry;
  }

  /**
   * Update an existing cost entry
   */
  async updateCostEntry(
    id: string,
    data: UpdateCostEntryDto
  ): Promise<CostEntry> {
    // Get the existing entry for audit purposes
    const existingEntry = await this.getCostEntryById(id);

    const updatedEntry = await this.prisma.costEntry.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    // Log the update in audit trail
    await this.auditService.logAction({
      table_name: 'cost_entries',
      record_id: id,
      action: 'UPDATE',
      old_values: existingEntry,
      new_values: updatedEntry,
      changed_by: data.updated_by || data.created_by || 'system',
      store_id: updatedEntry.store_id,
    });

    this.logger.log(`Updated cost entry ${id}`);

    return updatedEntry;
  }

  /**
   * Soft delete a cost entry
   */
  async deleteCostEntry(
    id: string,
    deletedBy: string
  ): Promise<{ deleted: boolean; message: string }> {
    // Get the existing entry for audit purposes
    const existingEntry = await this.getCostEntryById(id);

    // For demonstration, we'll add a deleted_at field (would need to add this to Prisma schema)
    // For now, we'll use a soft delete approach by updating a flag or moving to deleted table

    // Since we don't have a soft delete field in the current schema,
    // we'll implement it by adding a category prefix to mark as deleted
    const updatedEntry = await this.prisma.costEntry.update({
      where: { id },
      data: {
        category: `[DELETED] ${existingEntry.category}`,
        updated_at: new Date(),
      },
    });

    // Log the deletion in audit trail
    await this.auditService.logAction({
      table_name: 'cost_entries',
      record_id: id,
      action: 'DELETE',
      old_values: existingEntry,
      new_values: updatedEntry,
      changed_by: deletedBy,
      store_id: existingEntry.store_id,
    });

    this.logger.log(`Soft deleted cost entry ${id}`);

    return {
      deleted: true,
      message: 'Cost entry has been successfully deleted',
    };
  }

  /**
   * Generate cost summary statistics
   */
  private async generateCostSummary(
    where: Prisma.CostEntryWhereInput
  ): Promise<CostSummaryDto> {
    // Get all cost entries matching the filter for aggregation
    const costEntries = await this.prisma.costEntry.findMany({
      where,
      select: {
        amount: true,
        category: true,
        payer: true,
      },
    });

    const totalCosts = costEntries.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );

    const costsByCategory = costEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + Number(entry.amount);
      return acc;
    }, {} as Record<string, number>);

    const costsByPayer = costEntries.reduce((acc, entry) => {
      acc[entry.payer] = (acc[entry.payer] || 0) + Number(entry.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCosts: Math.round(totalCosts * 100) / 100, // Round to 2 decimal places
      costsByCategory,
      costsByPayer,
      count: costEntries.length,
    };
  }

  /**
   * Validate cost entry data
   */
  async validateCostEntry(data: CreateCostEntryDto): Promise<{
    isValid: boolean;
    exceptions: string[];
  }> {
    // Use the new exception detection service
    const result = await this.exceptionDetectionService.validateCostData(data);

    return {
      isValid: result.isValid,
      exceptions: result.exceptions.map((ex) => ex.message),
    };
  }
}
