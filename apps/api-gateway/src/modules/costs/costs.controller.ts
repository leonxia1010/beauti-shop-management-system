import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CostsService } from './costs.service';
import {
  CreateCostEntryDto,
  UpdateCostEntryDto,
  CostFilterDto,
  CostListResponseDto,
} from './dto';
import { CostEntry } from '@prisma/client';

@Controller('v1/costs')
export class CostsController {
  private readonly logger = new Logger(CostsController.name);

  constructor(private readonly costsService: CostsService) {}

  /**
   * POST /api/v1/costs
   * Create a new cost entry
   */
  @Post()
  async createCostEntry(
    @Body(ValidationPipe) createDto: CreateCostEntryDto
  ): Promise<CostEntry> {
    this.logger.log(`Creating cost entry for store ${createDto.store_id}`);

    // Validate cost entry data
    const validation = await this.costsService.validateCostEntry(createDto);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Validation failed: ${validation.exceptions.join(', ')}`
      );
    }

    return this.costsService.createCostEntry(createDto);
  }

  /**
   * GET /api/v1/costs
   * Get cost entries with filtering and summary statistics
   */
  @Get()
  async getCostEntries(
    @Query(new ValidationPipe({ transform: true })) filter: CostFilterDto
  ): Promise<CostListResponseDto> {
    this.logger.log(`Fetching cost entries for store ${filter.store_id}`);
    return this.costsService.getCostEntries(filter);
  }

  /**
   * GET /api/v1/costs/:id
   * Get a single cost entry by ID
   */
  @Get(':id')
  async getCostEntryById(@Param('id') id: string): Promise<CostEntry> {
    const costEntry = await this.costsService.getCostEntryById(id);
    return costEntry;
  }

  /**
   * PUT /api/v1/costs/:id
   * Update an existing cost entry
   */
  @Put(':id')
  async updateCostEntry(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateCostEntryDto
  ): Promise<CostEntry> {
    this.logger.log(`Updating cost entry ${id}`);

    // Check if cost entry exists
    const existingEntry = await this.costsService.getCostEntryById(id);
    if (!existingEntry) {
      throw new NotFoundException(`Cost entry with ID ${id} not found`);
    }

    // Validate updated data if amount is being changed
    if (updateDto.amount) {
      const validation = await this.costsService.validateCostEntry({
        ...existingEntry,
        ...updateDto,
      } as CreateCostEntryDto);

      if (!validation.isValid) {
        throw new BadRequestException(
          `Validation failed: ${validation.exceptions.join(', ')}`
        );
      }
    }

    return this.costsService.updateCostEntry(id, updateDto);
  }

  /**
   * DELETE /api/v1/costs/:id
   * Soft delete a cost entry
   */
  @Delete(':id')
  async deleteCostEntry(
    @Param('id') id: string,
    @Body('deleted_by') deletedBy?: string
  ): Promise<{ deleted: boolean; message: string }> {
    this.logger.log(`Deleting cost entry ${id}`);

    // Check if cost entry exists
    const existingEntry = await this.costsService.getCostEntryById(id);
    if (!existingEntry) {
      throw new NotFoundException(`Cost entry with ID ${id} not found`);
    }

    return this.costsService.deleteCostEntry(id, deletedBy || 'system');
  }
}
