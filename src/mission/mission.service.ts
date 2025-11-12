import { Injectable } from '@nestjs/common';
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
  findAll() {
    return this.missionRepository.find({
      relations: ['steps', 'reports'],
    });
  }

  /**
   * Récupérer une mission par son ID
   * Inclut les relations avec les étapes et les rapports
   * @param id - Identifiant unique de la mission
   * @returns La mission trouvée ou null
   */
  findOne(id: string) {
    return this.missionRepository.findOne({
      where: { id },
      relations: ['steps', 'reports'],
    });
  }

  /**
   * Mettre à jour une mission existante
   * @param id - Identifiant de la mission à modifier
   * @param updateMissionDto - Nouvelles données de la mission
   * @returns La mission mise à jour
   */
  async update(id: string, updateMissionDto: UpdateMissionDto) {
    await this.missionRepository.update(id, updateMissionDto);
    return this.findOne(id);
  }

  /**
   * Supprimer une mission
   * Supprime également toutes les étapes et rapports associés (cascade)
   * @param id - Identifiant de la mission à supprimer
   * @returns Confirmation de suppression
   */
  async remove(id: string) {
    await this.missionRepository.delete(id);
    return { deleted: true };
  }
}
