import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Step } from '../entities/step.entity';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepRepository: Repository<Step>,
  ) {}

  create(createStepDto: CreateStepDto) {
    const step = this.stepRepository.create(createStepDto);
    return this.stepRepository.save(step);
  }

  findAll() {
    return this.stepRepository.find({ relations: ['mission'] });
  }

  // Trouver les steps d'une mission spécifique
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
    await this.stepRepository.update(id, updateStepDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.stepRepository.delete(id);
    return { deleted: true };
  }
}
