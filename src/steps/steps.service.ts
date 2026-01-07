import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Step } from '../entities/step.entity';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ChatGateway } from '../chat/chat.gateway';
import { MissionEventType } from '../mission/dto/mission-notification.dto';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepRepository: Repository<Step>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(createStepDto: CreateStepDto) {
    const step = this.stepRepository.create(createStepDto);
    const savedStep = await this.stepRepository.save(step);

    // Récupérer le step avec la mission pour la notification
    const stepWithMission = await this.findOne(savedStep.id);
    if (stepWithMission?.mission) {
      this.chatGateway.broadcastMissionNotification({
        missionId: stepWithMission.mission.id,
        eventType: MissionEventType.STEP_ADDED,
        agentId: 'all',
        message: `Nouvelle étape ajoutée à la mission ${stepWithMission.mission.codeName || stepWithMission.mission.id}`,
        timestamp: new Date(),
      });
    }

    return savedStep;
  }

  findAll() {
    return this.stepRepository.find({ relations: ['mission'] });
  }

  findByMission(missionId: string) {
    return this.stepRepository.find({
      where: { mission: { id: missionId } },
    });
  }

  findOne(id: string) {
    return this.stepRepository.findOne({
      where: { id },
      relations: ['mission'],
    });
  }

  async update(id: string, updateStepDto: UpdateStepDto) {
    const step = await this.findOne(id);
    await this.stepRepository.update(id, updateStepDto);

    if (step?.mission) {
      this.chatGateway.broadcastMissionNotification({
        missionId: step.mission.id,
        eventType: MissionEventType.STEP_UPDATED,
        agentId: 'all',
        message: `Étape modifiée dans la mission ${step.mission.codeName || step.mission.id}`,
        timestamp: new Date(),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const step = await this.findOne(id);

    if (step?.mission) {
      this.chatGateway.broadcastMissionNotification({
        missionId: step.mission.id,
        eventType: MissionEventType.STEP_DELETED,
        agentId: 'all',
        message: `Étape supprimée de la mission ${step.mission.codeName || step.mission.id}`,
        timestamp: new Date(),
      });
    }

    await this.stepRepository.delete(id);
    return { deleted: true };
  }
}
