import { PhaseStatus } from './enums';
import { RenovationProject } from './project';

// 一次提交形成一个不可变版本，审核意见随版本保留
export interface DesignSubmission {
  id: string;
  phaseId: string;
  version: number;
  description: string;
  fileUrls: string[];
  status: PhaseStatus;
  reviewComment?: string;
  reviewerId?: string;
  reviewedAt?: string;
  submitterId: string;
  submittedAt: string;
}

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
  submissions: DesignSubmission[];
  currentVersion: number;
  currentSubmissionId: string | null;
}

export interface SubmitDesignPayload {
  description: string;
  fileUrls: string[];
}
