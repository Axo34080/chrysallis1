import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

/**
 * Service gérant la logique métier des missions
 * Contient toutes les opérations CRUD sur les missions
 */
@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(
    // Injection du repository TypeORM pour accéder à la base de données
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
  ) {}

  /**
   * Créer une nouvelle mission
   * @param createMissionDto - Données de la mission à créer
   * @returns La mission créée
   */
  create(createMissionDto: CreateMissionDto) {
    const mission = this.missionRepository.create(createMissionDto);
    return this.missionRepository.save(mission);
  }

  /**
   * Récupérer toutes les missions
   * Inclut les relations avec les étapes et les rapports
   * @returns Liste de toutes les missions
   */
  async findAll() {
    this.logger.log('Fetching all missions');
    const missions = await this.missionRepository.find({
      relations: ['steps'],
    });
    this.logger.debug(`Found ${missions.length} missions`);
    return missions;
  }

  /**
   * Récupérer une mission par son ID
   * Inclut les relations avec les étapes et les rapports
   * @param id - Identifiant unique de la mission
   * @returns La mission trouvée ou null
   */
  async findOne(id: number) {
    this.logger.log(`Fetching mission with id: ${id}`);
    const mission = await this.missionRepository.findOne({
      where: { id: id.toString() },
      relations: ['steps'],
    });
    if (!mission) {
      this.logger.warn(`Mission with id ${id} not found`);
      throw new NotFoundException(`Mission with ID ${id} not found`);
    }
    return mission;
  }

  /**
   * Mettre à jour une mission existante
   * @param id - Identifiant de la mission à modifier
   * @param updateMissionDto - Nouvelles données de la mission
   * @returns La mission mise à jour
   */
  async update(id: number, updateMissionDto: UpdateMissionDto) {
    await this.missionRepository.update(id, updateMissionDto);
    return this.findOne(id);
  }

  /**
   * Supprimer une mission
   * Supprime également toutes les étapes et rapports associés (cascade)
   * @param id - Identifiant de la mission à supprimer
   * @returns Confirmation de suppression
   */
  async remove(id: number) {
    await this.missionRepository.delete(id);
    return { deleted: true };
  }
}
