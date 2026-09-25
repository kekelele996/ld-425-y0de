import { PhaseStatus, VersionReviewStatus } from './enums';
import { RenovationProject } from './project';

export interface DesignPhase {
  id: string;
  projectId: string;
  project?: RenovationProject;
  name: string;
  designerId: string;
  status: PhaseStatus;
  version: number;
  description: string;
  fileUrls: string[];
  reviewComment?: string;
  reviewerId?: string;
}

export interface DesignVersion {
  id: string;
  phaseId: string;
  version: number;
  description: string;
  fileUrls: string[];
  status: VersionReviewStatus;
  reviewComment?: string;
  reviewerId?: string;
  submittedAt: string;
  reviewedAt?: string;
}
