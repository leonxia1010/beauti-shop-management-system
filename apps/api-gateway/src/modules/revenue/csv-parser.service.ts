import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateServiceSessionDto } from './dto';
import * as csv from 'csv-parse';
import * as XLSX from 'xlsx';

/** Multer file interface - uses any for compatibility with both test and production builds */
interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class CsvParserService {
  /**
   * Parse CSV or Excel file and return array of CreateServiceSessionDto
   */
  async parseFile(file: UploadedFile): Promise<CreateServiceSessionDto[]> {
    const fileExtension = this.getFileExtension(file.originalname);

    if (fileExtension === 'csv') {
      return this.parseCsvFile(file);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      return this.parseExcelFile(file);
    } else {
      throw new BadRequestException(
        'Unsupported file format. Please upload CSV or Excel file.'
      );
    }
  }

  /**
   * Parse CSV file
   */
  private async parseCsvFile(
    file: UploadedFile
  ): Promise<CreateServiceSessionDto[]> {
    return new Promise((resolve, reject) => {
      const records: CreateServiceSessionDto[] = [];
      const parser = csv.parse({
        columns: true, // Use first line as headers
        skip_empty_lines: true,
        trim: true,
      });

      parser.on('data', (data) => {
        try {
          const session = this.mapRowToServiceSession(data);
          records.push(session);
        } catch (error) {
          reject(
            new BadRequestException(`Invalid data in CSV row: ${error.message}`)
          );
        }
      });

      parser.on('error', (error) => {
        reject(new BadRequestException(`CSV parsing error: ${error.message}`));
      });

      parser.on('end', () => {
        resolve(records);
      });

      parser.write(file.buffer);
      parser.end();
    });
  }

  /**
   * Parse Excel file
   */
  private parseExcelFile(file: UploadedFile): CreateServiceSessionDto[] {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new BadRequestException(
          'Excel file must contain at least 2 rows (header + data)'
        );
      }

      const headers = jsonData[0] as string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataRows = jsonData.slice(1) as any[][];

      const records: CreateServiceSessionDto[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (
          row.some(
            (cell: unknown) =>
              cell !== null && cell !== undefined && cell !== ''
          )
        ) {
          try {
            // Convert array to object using headers

            const rowObject = headers.reduce((obj, header, index) => {
              obj[header] = row[index];
              return obj;
            }, {} as any);

            const session = this.mapRowToServiceSession(rowObject);
            records.push(session);
          } catch (error) {
            throw new BadRequestException(
              `Invalid data in Excel row ${i + 2}: ${error.message}`
            );
          }
        }
      }

      return records;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Excel parsing error: ${error.message}`);
    }
  }

  /**
   * Map row data to CreateServiceSessionDto
   * Expected columns: store_id, beautician_id, service_date, gross_revenue, payment_method, subsidy (optional)
   */
  /**
   * Map CSV/Excel row to DTO
   * @param row - Uses `any` for dynamic property access from parsed CSV/Excel data
   */
  private mapRowToServiceSession(row: any): CreateServiceSessionDto {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Validate required fields
    const requiredFields = [
      'store_id',
      'beautician_id',
      'service_date',
      'gross_revenue',
      'payment_method',
    ];
    const missingFields = requiredFields.filter((field) => !row[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Parse and validate gross_revenue
    const grossRevenue = parseFloat(row.gross_revenue);
    if (isNaN(grossRevenue) || grossRevenue <= 0) {
      throw new Error('gross_revenue must be a positive number');
    }

    // Parse service_date
    const serviceDate = this.parseDate(row.service_date);
    if (!serviceDate) {
      throw new Error('service_date must be a valid date (YYYY-MM-DD format)');
    }

    // Validate payment_method
    const validPaymentMethods = ['cash', 'transfer', 'other'];
    if (!validPaymentMethods.includes(row.payment_method?.toLowerCase())) {
      throw new Error(
        `payment_method must be one of: ${validPaymentMethods.join(', ')}`
      );
    }

    // Parse optional subsidy
    let subsidy: number | undefined;
    if (
      row.subsidy !== undefined &&
      row.subsidy !== null &&
      row.subsidy !== ''
    ) {
      subsidy = parseFloat(row.subsidy);
      if (isNaN(subsidy)) {
        throw new Error('subsidy must be a valid number');
      }
    }

    return {
      store_id: row.store_id.toString().trim(),
      beautician_id: row.beautician_id.toString().trim(),
      service_date: serviceDate,
      gross_revenue: grossRevenue,
      payment_method: row.payment_method.toLowerCase(),
      ...(subsidy !== undefined && { subsidy }),
    };
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(
    dateInput: string | number | Date | null | undefined
  ): string | null {
    if (!dateInput) return null;

    // Handle Excel serial date numbers
    if (typeof dateInput === 'number') {
      const excelDate = XLSX.SSF.parse_date_code(dateInput);
      return new Date(excelDate.y, excelDate.m - 1, excelDate.d)
        .toISOString()
        .split('T')[0];
    }

    // Handle string dates
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().split('T')[0];
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}
