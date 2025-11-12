import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldReportDto } from './create-field-report.dto';

export class UpdateFieldReportDto extends PartialType(CreateFieldReportDto) {}
