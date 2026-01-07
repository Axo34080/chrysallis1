import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldReport } from '../entities/field-report.entity'; // ← Import FieldReport
import { FieldReportsController } from './field-reports.controller';
import { FieldReportsService } from './field-reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([FieldReport])],
  controllers: [FieldReportsController],
  providers: [FieldReportsService],
  exports: [FieldReportsService],
})
export class FieldReportsModule {}
