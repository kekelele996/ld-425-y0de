import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PhaseStatus } from '../types/enums';
import { DesignPhase } from './designPhase.entity';

@Entity('design_submissions')
export class DesignSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phaseId: string;

  @ManyToOne(() => DesignPhase, (phase) => phase.submissions, { onDelete: 'CASCADE' })
  phase: DesignPhase;

  // 版本号在同一设计阶段内自增，每次提交生成一条独立记录
  @Column()
  version: number;

  @Column('text')
  description: string;

  @Column('simple-json')
  fileUrls: string[];

  @Column({ type: 'enum', enum: PhaseStatus })
  status: PhaseStatus;

  @Column('text', { nullable: true })
  reviewComment?: string;

  @Column({ nullable: true })
  reviewerId?: string;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @Column()
  submitterId: string;

  @CreateDateColumn()
  submittedAt: Date;
}
