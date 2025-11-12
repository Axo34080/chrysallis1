import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mission } from './mission.entity';

/**
 * Entité Step - Représente une étape d'une mission
 * Chaque mission peut avoir plusieurs étapes à accomplir dans un ordre précis
 */
@Entity('steps')
export class Step {
  // Identifiant unique de l'étape
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Titre de l'étape (ex: "Infiltration du bâtiment")
  @Column({ length: 200 })
  title: string;

  // Description détaillée de l'étape
  @Column('text', { nullable: true })
  description: string;

  // Statut de l'étape
  // pending: en attente, in_progress: en cours, completed: terminée, failed: échouée
  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  // Ordre d'exécution de l'étape (0, 1, 2, ...)
  @Column({ type: 'int', default: 0 })
  order: number;

  // Instructions chiffrées pour cette étape
  @Column('text', { nullable: true })
  encryptedInstructions: string;

  // Mission à laquelle appartient cette étape (relation ManyToOne)
  // Suppression en cascade : si la mission est supprimée, l'étape l'est aussi
  @ManyToOne(() => Mission, (mission) => mission.steps, { onDelete: 'CASCADE' })
  mission: Mission;

  // Date de création automatique
  @CreateDateColumn()
  createdAt: Date;

  // Date de dernière mise à jour automatique
  @UpdateDateColumn()
  updatedAt: Date;
}
