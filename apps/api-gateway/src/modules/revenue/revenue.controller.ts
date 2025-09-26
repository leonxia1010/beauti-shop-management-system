import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RevenueService } from './revenue.service';
import { CsvParserService } from './csv-parser.service';
import {
  CreateServiceSessionDto,
  UpdateServiceSessionDto,
  ServiceSessionFilterDto,
  BulkImportResponseDto,
} from './dto';
import { ServiceSession } from '@prisma/client';

@Controller('v1/revenue')
export class RevenueController {
  private readonly logger = new Logger(RevenueController.name);

  constructor(
    private readonly revenueService: RevenueService,
    private readonly csvParserService: CsvParserService
  ) {}

  /**
   * POST /api/v1/revenue/bulk-import
   * Bulk import service sessions from CSV/Excel file
   */
  @Post('bulk-import')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(
    @UploadedFile() file: Express.Multer.File,
    @Body('store_id') storeId: string
  ): Promise<BulkImportResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!storeId) {
      throw new BadRequestException('store_id is required');
    }

    // Validate file type
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only CSV and Excel files are allowed.'
      );
    }

    this.logger.log(
      `Processing bulk import for store ${storeId}, file: ${file.originalname}`
    );

    try {
      // Parse CSV/Excel file
      const sessions = await this.csvParserService.parseFile(file);

      // Validate all sessions before import
      const validationResults = await Promise.all(
        sessions.map((session, index) =>
          this.revenueService
            .validateSession(session)
            .then((result) => ({ ...result, index }))
        )
      );

      // Filter out invalid sessions and collect validation errors
      const validSessions: CreateServiceSessionDto[] = [];
      const validationErrors: Array<{ row: number; error: string; data: any }> =
        [];

      for (const result of validationResults) {
        if (result.isValid) {
          validSessions.push(sessions[result.index]);
        } else {
          validationErrors.push({
            row: result.index + 1,
            error: result.exceptions.join(', '),
            data: sessions[result.index],
          });
        }
      }

      // Import valid sessions
      const importResult = await this.revenueService.bulkImportSessions(
        validSessions,
        storeId
      );

      // Combine import errors with validation errors
      const allErrors = [...validationErrors, ...importResult.errors];

      return {
        total: sessions.length,
        successful: importResult.successful,
        failed: importResult.failed + validationErrors.length,
        errors: allErrors,
      };
    } catch (error) {
      this.logger.error(`Bulk import failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process file: ${error.message}`);
    }
  }

  /**
   * GET /api/v1/revenue/sessions
   * Get paginated service sessions with filtering
   */
  @Get('sessions')
  async getSessions(
    @Query(new ValidationPipe({ transform: true }))
    filter: ServiceSessionFilterDto
  ) {
    this.logger.log(`Fetching sessions for store ${filter.store_id}`);
    return this.revenueService.getSessions(filter);
  }

  /**
   * POST /api/v1/revenue/sessions
   * Create a single service session
   */
  @Post('sessions')
  async createSession(
    @Body(ValidationPipe) createDto: CreateServiceSessionDto
  ): Promise<ServiceSession> {
    this.logger.log(`Creating session for store ${createDto.store_id}`);

    // Validate session data
    const validation = await this.revenueService.validateSession(createDto);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Validation failed: ${validation.exceptions.join(', ')}`
      );
    }

    return this.revenueService.createSession(createDto);
  }

  /**
   * PUT /api/v1/revenue/sessions/:id
   * Update an existing service session
   */
  @Put('sessions/:id')
  async updateSession(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateServiceSessionDto
  ): Promise<ServiceSession> {
    this.logger.log(`Updating session ${id}`);

    // Check if session exists
    const existingSession = await this.revenueService.getSessionById(id);
    if (!existingSession) {
      throw new NotFoundException(`Service session with ID ${id} not found`);
    }

    // Validate updated data if gross_revenue is being changed
    if (updateDto.gross_revenue) {
      const validation = await this.revenueService.validateSession({
        ...existingSession,
        ...updateDto,
      } as CreateServiceSessionDto);

      if (!validation.isValid) {
        throw new BadRequestException(
          `Validation failed: ${validation.exceptions.join(', ')}`
        );
      }
    }

    return this.revenueService.updateSession(id, updateDto);
  }

  /**
   * GET /api/v1/revenue/sessions/:id
   * Get single service session by ID
   */
  @Get('sessions/:id')
  async getSessionById(@Param('id') id: string): Promise<ServiceSession> {
    const session = await this.revenueService.getSessionById(id);
    if (!session) {
      throw new NotFoundException(`Service session with ID ${id} not found`);
    }
    return session;
  }
}
