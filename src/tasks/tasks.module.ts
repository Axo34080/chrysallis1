import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Mission } from '../entities/mission.entity';
import { FieldReport } from '../entities/field-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, FieldReport])],
  providers: [TasksService],
})
export class TasksModule {}
