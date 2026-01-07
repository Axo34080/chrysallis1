import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldReport } from '../entities/field-report.entity';
import { CreateFieldReportDto } from './dto/create-field-report.dto';
import { UpdateFieldReportDto } from './dto/update-field-report.dto';
import { ChatGateway } from '../chat/chat.gateway';
import { MissionEventType } from '../mission/dto/mission-notification.dto';

@Injectable()
export class FieldReportsService {
  constructor(
    @InjectRepository(FieldReport)
    private fieldReportRepository: Repository<FieldReport>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(createFieldReportDto: CreateFieldReportDto) {
    const report = this.fieldReportRepository.create(createFieldReportDto);
    const savedReport = await this.fieldReportRepository.save(report);

    const reportWithMission = await this.findOne(savedReport.id);
    if (reportWithMission?.mission) {
      this.chatGateway.broadcastMissionNotification({
        missionId: reportWithMission.mission.id,
        eventType: MissionEventType.REPORT_ADDED,
        agentId: 'all',
        message: `Nouveau rapport ajouté à la mission ${reportWithMission.mission.codeName || reportWithMission.mission.id}`,
        timestamp: new Date(),
      });
    }

    return savedReport;
  }

  findAll() {
    return this.fieldReportRepository.find({ relations: ['mission'] });
  }

  findByMission(missionId: string) {
    return this.fieldReportRepository.find({
      where: { mission: { id: missionId } },
    });
  }

  findOne(id: string) {
    return this.fieldReportRepository.findOne({
      where: { id },
      relations: ['mission'],
    });
  }

  async update(id: string, updateFieldReportDto: UpdateFieldReportDto) {
    const report = await this.findOne(id);
    await this.fieldReportRepository.update(id, updateFieldReportDto);

    if (report?.mission) {
      this.chatGateway.broadcastMissionNotification({
        missionId: report.mission.id,
        eventType: MissionEventType.REPORT_UPDATED,
        agentId: 'all',
        message: `Rapport modifié dans la mission ${report.mission.codeName || report.mission.id}`,
        timestamp: new Date(),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const report = await this.findOne(id);

    if (report?.mission) {
      this.chatGateway.broadcastMissionNotification({
        missionId: report.mission.id,
        eventType: MissionEventType.REPORT_DELETED,
        agentId: 'all',
        message: `Rapport supprimé de la mission ${report.mission.codeName || report.mission.id}`,
        timestamp: new Date(),
      });
    }

    await this.fieldReportRepository.delete(id);
    return { deleted: true };
  }
}
