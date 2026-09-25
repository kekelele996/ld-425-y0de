import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PhaseStatus } from '../types/enums';
import { RenovationProject } from './project.entity';
import { DesignVersion } from './designVersion.entity';

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
  reviewComment?: string | null;

  @Column({ nullable: true })
  reviewerId?: string | null;

  @OneToMany(() => DesignVersion, (version) => version.phase)
  versions: DesignVersion[];
}
