/**
 * Service Session Repository
 *
 * Abstracts all Prisma operations for service_sessions table
 * Following Repository Pattern (coding-standards.md:109-115)
 *
 * NOTE: Partial implementation - Story 1.2 QA Fix
 * Full migration of RevenueService to use this repository planned for Story 1.5
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { ServiceSession, Prisma } from '@prisma/client';

@Injectable()
export class ServiceSessionRepository extends BaseRepository<ServiceSession> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findMany(
    where: Prisma.ServiceSessionWhereInput,
    options?: {
      take?: number;
      skip?: number;
      orderBy?: Prisma.ServiceSessionOrderByWithRelationInput;
      cursor?: Prisma.ServiceSessionWhereUniqueInput;
    }
  ): Promise<ServiceSession[]> {
    return this.prisma.serviceSession.findMany({
      where,
      ...options,
    });
  }

  async findUnique(
    where: Prisma.ServiceSessionWhereUniqueInput
  ): Promise<ServiceSession | null> {
    return this.prisma.serviceSession.findUnique({ where });
  }

  async create(
    data: Prisma.ServiceSessionCreateInput
  ): Promise<ServiceSession> {
    return this.prisma.serviceSession.create({ data });
  }

  async update(
    where: Prisma.ServiceSessionWhereUniqueInput,
    data: Prisma.ServiceSessionUpdateInput
  ): Promise<ServiceSession> {
    return this.prisma.serviceSession.update({ where, data });
  }

  async count(where: Prisma.ServiceSessionWhereInput): Promise<number> {
    return this.prisma.serviceSession.count({ where });
  }

  /**
   * Bulk create with transaction support
   */
  async createMany(
    sessions: Prisma.ServiceSessionCreateInput[]
  ): Promise<number> {
    return this.transaction(async (tx) => {
      let successCount = 0;
      for (const session of sessions) {
        await tx.serviceSession.create({ data: session });
        successCount++;
      }
      return successCount;
    });
  }
}
