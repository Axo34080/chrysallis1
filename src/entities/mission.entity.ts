import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Step } from './step.entity';
import { FieldReport } from './field-report.entity';

/**
 * Entité Mission - Représente une mission d'agent secret
 * Contient toutes les informations sur une mission ainsi que ses étapes et rapports
 */
@Entity('missions')
export class Mission {
  // Genere un id
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nom de code de la mission (ex: "Opération Phénix")
  @Column({ length: 200, nullable: true })
  codeName: string;

  // Description détaillée de la mission
  @Column('text', { nullable: true })
  description: string;

  // Lieu où se déroule la mission
  @Column({ length: 200, nullable: true })
  location: string;

  // Date de début de la mission
  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  // Date de fin de la mission
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  // Statut actuel de la mission
  // ASSIGNED: assignée, IN_PROGRESS: en cours, COMPLETED: terminée, COMPROMISED: compromise
  @Column({
    type: 'enum',
    enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'COMPROMISED', 'CANCELLED'],
    default: 'ASSIGNED',
  })
  status: string;

  // Niveau de classification de la mission
  // TOP_SECRET: top secret, SECRET: secret, CONFIDENTIAL: confidentiel
  @Column({
    type: 'enum',
    enum: ['TOP_SECRET', 'SECRET', 'CONFIDENTIAL'],
    default: 'CONFIDENTIAL',
  })
  classificationLevel: string;

  // Données chiffrées supplémentaires de la mission
  @Column('text', { nullable: true })
  encryptedData: string;

  // ID de l'agent assigné à la mission
  @Column({ length: 100, nullable: true })
  agentId: string;

  // Titre de la mission (pour les notifications)
  @Column({ length: 200, nullable: true })
  title: string;

  // Liste des étapes de la mission (relation OneToMany)
  // Suppression en cascade : si la mission est supprimée, toutes ses étapes le sont aussi
  @OneToMany(() => Step, (step) => step.mission, { cascade: true })
  steps: Step[];

  // Liste des rapports de terrain de la mission (relation OneToMany)
  // Suppression en cascade : si la mission est supprimée, tous ses rapports le sont aussi
  @OneToMany(() => FieldReport, (report) => report.mission, { cascade: true })
  reports: FieldReport[];

  // Date de création automatique
  @CreateDateColumn()
  createdAt: Date;

  // Date de dernière mise à jour automatique
  @UpdateDateColumn()
  updatedAt: Date;
}
