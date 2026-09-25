import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PhaseStatus } from '../types/enums';
import { RenovationProject } from './project.entity';
import { DesignSubmission } from './designSubmission.entity';

@Entity('design_phases')
export class DesignPhase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => RenovationProject, (project) => project.designPhases, { onDelete: 'CASCADE' })
  project: RenovationProject;

  @Column()
  name: string;

  @Column()
  designerId: string;

  @Column({ type: 'enum', enum: PhaseStatus })
  status: PhaseStatus;

  @Column()
  version: number;

  @Column('text')
  description: string;

  @Column('simple-json')
  fileUrls: string[];

  @Column('text', { nullable: true })
  reviewComment?: string;

  @Column({ nullable: true })
  reviewerId?: string;

  // 每次提交形成独立版本，旧版本与审核意见永久保留
  @OneToMany(() => DesignSubmission, (submission) => submission.phase, { cascade: true })
  submissions: DesignSubmission[];
}
