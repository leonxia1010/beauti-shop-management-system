import {
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateServiceSessionDto {
  @IsString()
  store_id: string;

  @IsString()
  beautician_id: string;

  @IsDateString()
  service_date: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  gross_revenue: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  subsidy?: number;
}
