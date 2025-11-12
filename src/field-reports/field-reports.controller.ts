import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FieldReportsService } from './field-reports.service';
import { CreateFieldReportDto } from './dto/create-field-report.dto';
import { UpdateFieldReportDto } from './dto/update-field-report.dto';

@Controller('field-reports')
export class FieldReportsController {
  constructor(private readonly fieldReportsService: FieldReportsService) {}

  @Get()
  findAll() {
    return this.fieldReportsService.findAll();
  }

  @Post()
  create(@Body() createFieldReportDto: CreateFieldReportDto) {
    return this.fieldReportsService.create(createFieldReportDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldReportsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFieldReportDto: UpdateFieldReportDto,
  ) {
    return this.fieldReportsService.update(id, updateFieldReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldReportsService.remove(id);
  }
}
