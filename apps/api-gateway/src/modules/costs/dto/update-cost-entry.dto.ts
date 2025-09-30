import { PartialType } from '@nestjs/mapped-types';
import { CreateCostEntryDto } from './create-cost-entry.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCostEntryDto extends PartialType(CreateCostEntryDto) {
  @IsOptional()
  @IsString()
  updated_by?: string; // Track who made the update
}
