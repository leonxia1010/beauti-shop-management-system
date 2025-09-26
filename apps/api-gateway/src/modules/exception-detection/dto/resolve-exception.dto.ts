import { IsString } from 'class-validator';

export class ResolveExceptionDto {
  @IsString()
  resolved_by: string;
}
