import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionService } from './mission.service';
import { MissionController } from './mission.controller';
import { Mission } from '../entities/mission.entity';
import { StepsModule } from '../steps/steps.module';
import { FieldReportsModule } from '../field-reports/field-reports.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission]),
    StepsModule,
    FieldReportsModule,
    ChatModule,
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
