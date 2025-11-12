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
 * Entité FieldReport - Représente un rapport de terrain envoyé par un agent
 * Les agents envoient ces rapports chiffrés pendant ou après leurs missions
 */
@Entity('field_reports')
export class FieldReport {
  // Identifiant unique du rapport
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Contenu chiffré du rapport (pour la sécurité)
  @Column('text')
  encryptedContent: string;

  // Lieu d'où le rapport a été envoyé
  @Column({ length: 200, nullable: true })
  location: string;

  // Coordonnées GPS - Latitude
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  // Coordonnées GPS - Longitude
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  // Statut du rapport
  // draft: brouillon, submitted: envoyé, reviewed: relu, classified: classifié
  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'reviewed', 'classified'],
    default: 'draft',
  })
  status: string;

  // Liste des pièces jointes (photos, documents, etc.)
  // Stocké sous forme de tableau de chaînes (URLs ou chemins)
  @Column('simple-array', { nullable: true })
  attachments: string[];

  // Mission à laquelle appartient ce rapport (relation ManyToOne)
  // Suppression en cascade : si la mission est supprimée, le rapport l'est aussi
  @ManyToOne(() => Mission, (mission) => mission.reports, {
    onDelete: 'CASCADE',
  })
  mission: Mission;

  // Date d'envoi du rapport
  @CreateDateColumn()
  createdAt: Date;

  // Date de dernière modification du rapport
  @UpdateDateColumn()
  updatedAt: Date;
}
