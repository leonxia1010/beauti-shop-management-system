import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCostEntryDto {
  @IsString()
  @MaxLength(100)
  store_id: string;

  @IsString()
  @MaxLength(100)
  category: string;

  @IsString()
  @MaxLength(100)
  payer: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  allocation_rule_id?: string;

  @IsString()
  @MaxLength(100)
  created_by: string;
}
