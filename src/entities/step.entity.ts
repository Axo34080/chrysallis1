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

  // Description de l'étape
  @Column('text', { nullable: true })
  description: string;

  // Agent assigné à cette étape
  @Column({ length: 200, nullable: true })
  assignedAgent: string;

  // Lieu de l'étape
  @Column({ length: 200, nullable: true })
  location: string;

  // Date de début
  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  // Date de fin
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  // Statut de l'étape
  @Column({ length: 50, default: 'ASSIGNED' })
  status: string;

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
