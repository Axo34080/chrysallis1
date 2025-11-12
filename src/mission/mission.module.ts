import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from '../entities/mission.entity';
import { Step } from '../entities/step.entity';
import { FieldReport } from '../entities/field-report.entity';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { StepsService } from '../steps/steps.service';
import { FieldReportsService } from '../field-reports/field-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, Step, FieldReport]), // ← Importer les 3 entités
  ],
  controllers: [MissionController],
  providers: [MissionService, StepsService, FieldReportsService], // ← Les 3 services
})
export class MissionModule {}
