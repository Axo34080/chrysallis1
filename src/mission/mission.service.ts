import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { ChatGateway } from '../chat/chat.gateway';
import {
  MissionNotificationDto,
  MissionEventType,
} from './dto/mission-notification.dto';

/**
 * Service gérant la logique métier des missions
 * Contient toutes les opérations CRUD sur les missions
 */
@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(createMissionDto: CreateMissionDto) {
    // Générer un ID si non fourni
    if (!createMissionDto.id) {
      createMissionDto.id = `mission-${Date.now()}`;
    }

    console.log('Creating mission with data:', createMissionDto); // DEBUG

    const mission = this.missionRepository.create(createMissionDto);
    console.log('Mission entity created:', mission); // DEBUG

    const savedMission = await this.missionRepository.save(mission);
    console.log('Mission saved:', savedMission); // DEBUG

    // Envoyer une notification WebSocket
    const notification: MissionNotificationDto = {
      missionId: savedMission.id,
      eventType: MissionEventType.CREATED,
      agentId: savedMission.agentId || 'all',
      message: `Nouvelle mission créée: ${savedMission.title || savedMission.codeName || savedMission.id}`,
      timestamp: new Date(),
    };

    if (savedMission.agentId) {
      this.chatGateway.sendMissionNotification(notification);
    } else {
      this.chatGateway.broadcastMissionNotification(notification);
    }

    this.logger.log(`Mission ${savedMission.id} created and notification sent`);
    return savedMission;
  }

  async findAll() {
    this.logger.log('Fetching all missions');
    const missions = await this.missionRepository.find({
      relations: ['steps'],
    });
    this.logger.debug(`Found ${missions.length} missions`);
    return missions;
  }

  async findOne(id: string) {
    this.logger.log(`Fetching mission with id: ${id}`);
    const mission = await this.missionRepository.findOne({
      where: { id },
      relations: ['steps'],
    });
    if (!mission) {
      this.logger.warn(`Mission with id ${id} not found`);
      throw new NotFoundException(`Mission with ID ${id} not found`);
    }
    return mission;
  }

  async update(id: string, updateMissionDto: UpdateMissionDto) {
    await this.missionRepository.update(id, updateMissionDto);
    const updatedMission = await this.findOne(id);

    // Envoyer une notification WebSocket
    const notification: MissionNotificationDto = {
      missionId: updatedMission.id,
      eventType: MissionEventType.UPDATED,
      agentId: updatedMission.agentId || 'all',
      message: `Mission ${updatedMission.title || updatedMission.codeName || updatedMission.id} a été modifiée`,
      timestamp: new Date(),
    };

    if (updatedMission.agentId) {
      this.chatGateway.sendMissionNotification(notification);
    } else {
      this.chatGateway.broadcastMissionNotification(notification);
    }

    this.logger.log(`Mission ${id} updated and notification sent`);
    return updatedMission;
  }

  async remove(id: string, agentId?: string) {
    const mission = await this.findOne(id);
    await this.missionRepository.delete(id);

    // Envoyer une notification WebSocket
    const notification: MissionNotificationDto = {
      missionId: mission.id,
      eventType: MissionEventType.DELETED,
      agentId: agentId || mission.agentId || 'all',
      message: `Mission ${mission.title || mission.codeName || mission.id} a été supprimée`,
      timestamp: new Date(),
    };

    if (notification.agentId && notification.agentId !== 'all') {
      this.chatGateway.sendMissionNotification(notification);
    } else {
      this.chatGateway.broadcastMissionNotification(notification);
    }

    this.logger.log(`Mission ${id} deleted and notification sent`);
    return { deleted: true };
  }

  async cancel(id: string, agentId?: string) {
    const mission = await this.findOne(id);
    // Mettre à jour le statut
    await this.missionRepository.update(id, { status: 'CANCELLED' });

    // Envoyer une notification WebSocket
    const notification: MissionNotificationDto = {
      missionId: mission.id,
      eventType: MissionEventType.CANCELLED,
      agentId: agentId || mission.agentId || 'all',
      message: `Mission ${mission.title || mission.codeName || mission.id} a été annulée`,
      timestamp: new Date(),
    };

    if (notification.agentId && notification.agentId !== 'all') {
      this.chatGateway.sendMissionNotification(notification);
    } else {
      this.chatGateway.broadcastMissionNotification(notification);
    }

    this.logger.log(`Mission ${id} cancelled and notification sent`);
    return this.findOne(id);
  }

  async complete(id: string, agentId?: string) {
    const mission = await this.findOne(id);
    // Mettre à jour le statut
    await this.missionRepository.update(id, { status: 'COMPLETED' });

    // Envoyer une notification WebSocket
    const notification: MissionNotificationDto = {
      missionId: mission.id,
      eventType: MissionEventType.COMPLETED,
      agentId: agentId || mission.agentId || 'all',
      message: `Mission ${mission.title || mission.codeName || mission.id} a été terminée`,
      timestamp: new Date(),
    };

    if (notification.agentId && notification.agentId !== 'all') {
      this.chatGateway.sendMissionNotification(notification);
    } else {
      this.chatGateway.broadcastMissionNotification(notification);
    }

    this.logger.log(`Mission ${id} completed and notification sent`);
    return this.findOne(id);
  }
}
