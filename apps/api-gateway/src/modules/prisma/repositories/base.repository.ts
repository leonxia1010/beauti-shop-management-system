/**
 * Base Repository Pattern Implementation
 *
 * Following Repository Pattern from coding-standards.md:109-115
 * Provides abstraction layer over Prisma for:
 * - Transaction support
 * - Query optimization
 * - Testability without database
 */

import { PrismaService } from '../prisma.service';

export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Execute operation within a transaction
   * Supports nested transactions via Prisma interactive transactions
   */
  protected async transaction<R>(
    fn: (tx: PrismaService) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(async (prismaClient) => {
      // Cast is safe as Prisma transaction client has same interface
      return fn(prismaClient as unknown as PrismaService);
    });
  }
}
