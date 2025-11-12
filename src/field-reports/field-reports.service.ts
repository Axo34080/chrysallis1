import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldReport } from '../entities/field-report.entity';
import { CreateFieldReportDto } from './dto/create-field-report.dto';
import { UpdateFieldReportDto } from './dto/update-field-report.dto';

@Injectable()
export class FieldReportsService {
  constructor(
    @InjectRepository(FieldReport)
    private fieldReportRepository: Repository<FieldReport>,
  ) {}

  create(createFieldReportDto: CreateFieldReportDto) {
    const report = this.fieldReportRepository.create(createFieldReportDto);
    return this.fieldReportRepository.save(report);
  }

  findAll() {
    return this.fieldReportRepository.find({ relations: ['mission'] });
  }

  // Trouver les rapports d'une mission spécifique
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
    await this.fieldReportRepository.update(id, updateFieldReportDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.fieldReportRepository.delete(id);
    return { deleted: true };
  }
}
