import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceSessionDto } from './create-service-session.dto';

export class UpdateServiceSessionDto extends PartialType(
  CreateServiceSessionDto
) {
  // All fields from CreateServiceSessionDto are now optional
}
