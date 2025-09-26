import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  ValidationPipe,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ExceptionDetectionService } from './exception-detection.service';
import { ExceptionFilterDto, ResolveExceptionDto } from './dto';

@Controller('v1/exceptions')
export class ExceptionDetectionController {
  private readonly logger = new Logger(ExceptionDetectionController.name);

  constructor(private readonly exceptionService: ExceptionDetectionService) {}

  /**
   * GET /api/v1/exceptions
   * Get exception records with filtering
   */
  @Get()
  async getExceptions(
    @Query(new ValidationPipe({ transform: true })) filter: ExceptionFilterDto
  ) {
    this.logger.log(`Fetching exceptions for store ${filter.store_id}`);
    return this.exceptionService.getExceptions(filter);
  }

  /**
   * GET /api/v1/exceptions/stats
   * Get exception statistics for a store
   */
  @Get('stats')
  async getExceptionStats(@Query('store_id') storeId: string) {
    this.logger.log(`Fetching exception stats for store ${storeId}`);
    return this.exceptionService.getExceptionStats(storeId);
  }

  /**
   * PUT /api/v1/exceptions/:id/resolve
   * Resolve an exception
   */
  @Put(':id/resolve')
  async resolveException(
    @Param('id') id: string,
    @Body(ValidationPipe) resolveDto: ResolveExceptionDto
  ) {
    this.logger.log(`Resolving exception ${id}`);

    try {
      const resolvedException = await this.exceptionService.resolveException(
        id,
        resolveDto.resolved_by
      );
      return resolvedException;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Exception with ID ${id} not found`);
      }
      throw error;
    }
  }
}
