import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VersionReviewStatus } from '../types/enums';
import { DesignPhase } from './designPhase.entity';

@Entity('design_versions')
export class DesignVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phaseId: string;

  @ManyToOne(() => DesignPhase, (phase) => phase.versions, { onDelete: 'CASCADE' })
  phase: DesignPhase;

  @Column()
  version: number;

  @Column('text')
  description: string;

  @Column('simple-json')
  fileUrls: string[];

  @Column({ type: 'enum', enum: VersionReviewStatus, default: VersionReviewStatus.Pending })
  status: VersionReviewStatus;

  @Column('text', { nullable: true })
  reviewComment?: string | null;

  @Column({ nullable: true })
  reviewerId?: string | null;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;
}
