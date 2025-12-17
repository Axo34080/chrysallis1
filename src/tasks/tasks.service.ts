import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { FieldReport } from '../entities/field-report.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(FieldReport)
    private fieldReportRepository: Repository<FieldReport>,
  ) {}

  // Vérifier les missions tous les jours à minuit
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkMissions() {
    this.logger.log('Vérification quotidienne des missions');

    try {
      const missions = await this.missionRepository.find();
      const now = new Date();

      const expiredMissions = missions.filter(
        (mission) => mission.endDate && new Date(mission.endDate) < now,
      );

      this.logger.log(
        `⚠️ ${expiredMissions.length} mission(s) expirée(s) trouvée(s)`,
      );

      // Vous pouvez ajouter une logique ici (notifications, changement de statut, etc.)
    } catch (error) {
      this.logger.error(
        'Erreur lors de la vérification des missions',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // Nettoyer les anciennes données
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldData() {
    this.logger.log('🧹 Démarrage du nettoyage des données...');

    try {
      // Supprimer les missions terminées depuis plus de 90 jours
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deletedMissions = await this.missionRepository
        .createQueryBuilder()
        .delete()
        .where('endDate < :date', { date: ninetyDaysAgo })
        .execute();

      this.logger.log(`✅ ${deletedMissions.affected} mission(s) supprimée(s)`);

      // Supprimer les rapports de terrain de plus de 6 mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const deletedReports = await this.fieldReportRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :date', { date: sixMonthsAgo })
        .execute();

      this.logger.log(`✅ ${deletedReports.affected} rapport(s) supprimé(s)`);
    } catch (error) {
      this.logger.error(
        '❌ Erreur lors du nettoyage des données',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
