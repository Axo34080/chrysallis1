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
    const mission = this.missionRepository.create(createMissionDto);
    const savedMission = await this.missionRepository.save(mission);

    // Envoyer une notification WebSocket
    const notification: MissionNotificationDto = {
      missionId: savedMission.id, // Utiliser l'ID généré par PostgreSQL
      eventType: MissionEventType.CREATED,
      agentId: savedMission.agentId || 'all',
      message: `Nouvelle mission créée: ${savedMission.title || savedMission.codeName || savedMission.id}`,
      timestamp: new Date(),
    };

    console.log('[MissionService] Envoi notification CREATE:', notification);

    if (savedMission.agentId) {
      this.chatGateway.sendMissionNotification(notification);
    } else {
      this.chatGateway.broadcastMissionNotification(notification);
    }

    this.logger.log(`Mission ${savedMission.id} created and notification sent`);
    return savedMission;
  }

  async findAll() {
    return this.missionRepository.find({ relations: ['steps'] });
  }

  async findOne(id: string) {
    const mission = await this.missionRepository.findOne({
      where: { id },
      relations: ['steps'],
    });
    if (!mission) {
      throw new NotFoundException(`Mission with ID ${id} not found`);
    }
    return mission;
  }

  async update(id: string, updateMissionDto: UpdateMissionDto) {
    // Exclure les champs relationnels qui ne peuvent pas être mis à jour via update()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { steps, reports, ...updateData } =
      updateMissionDto as UpdateMissionDto & {
        steps?: unknown;
        reports?: unknown;
      };

    await this.missionRepository.update(id, updateData as Partial<Mission>);
    const updatedMission = await this.findOne(id);

    this.sendNotification({
      missionId: updatedMission.id,
      eventType: MissionEventType.UPDATED,
      agentId: updatedMission.agentId || 'all',
      message: `Mission ${this.getMissionName(updatedMission)} a été modifiée`,
      timestamp: new Date(),
    });

    return updatedMission;
  }

  async remove(id: string) {
    const mission = await this.findOne(id);
    await this.missionRepository.delete(id);

    this.sendNotification({
      missionId: mission.id,
      eventType: MissionEventType.DELETED,
      agentId: mission.agentId || 'all',
      message: `Mission ${this.getMissionName(mission)} a été supprimée`,
      timestamp: new Date(),
    });

    return { deleted: true };
  }

  async cancel(id: string) {
    const mission = await this.findOne(id);
    await this.missionRepository.update(id, { status: 'CANCELLED' });

    this.sendNotification({
      missionId: mission.id,
      eventType: MissionEventType.CANCELLED,
      agentId: mission.agentId || 'all',
      message: `Mission ${this.getMissionName(mission)} a été annulée`,
      timestamp: new Date(),
    });

    return this.findOne(id);
  }

  async complete(id: string) {
    const mission = await this.findOne(id);
    await this.missionRepository.update(id, { status: 'COMPLETED' });

    this.sendNotification({
      missionId: mission.id,
      eventType: MissionEventType.COMPLETED,
      agentId: mission.agentId || 'all',
      message: `Mission ${this.getMissionName(mission)} a été terminée`,
      timestamp: new Date(),
    });

    return this.findOne(id);
  }

  /** Retourne le nom d'affichage de la mission */
  private getMissionName(mission: Mission): string {
    return mission.title || mission.codeName || mission.id;
  }

  /** Envoie une notification via WebSocket à tous les clients */
  private sendNotification(notification: MissionNotificationDto): void {
    this.chatGateway.broadcastMissionNotification(notification);
  }
}
