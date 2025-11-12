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
  // Identifiant unique généré automatiquement (UUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nom de code de la mission (ex: "Opération Phénix")
  @Column({ length: 200 })
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
  // assigned: assignée, in_progress: en cours, completed: terminée, compromised: compromise
  @Column({
    type: 'enum',
    enum: ['assigned', 'in_progress', 'completed', 'compromised'],
    default: 'assigned',
  })
  status: string;

  // Niveau de classification de la mission
  // top_secret: top secret, secret: secret, confidential: confidentiel
  @Column({
    type: 'enum',
    enum: ['top_secret', 'secret', 'confidential'],
    default: 'confidential',
  })
  classificationLevel: string;

  // Données chiffrées supplémentaires de la mission
  @Column('text', { nullable: true })
  encryptedData: string;

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
