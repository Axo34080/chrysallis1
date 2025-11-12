import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from '../entities/step.entity'; // ← Import Step
import { StepsController } from './steps.controller';
import { StepsService } from './steps.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Step]), // ← AJOUTER CETTE LIGNE
  ],
  controllers: [StepsController],
  providers: [StepsService],
})
export class StepsModule {}
