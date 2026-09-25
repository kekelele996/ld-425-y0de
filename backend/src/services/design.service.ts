import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignPhase } from '../models/designPhase.entity';
import { DesignSubmission } from '../models/designSubmission.entity';
import { PhaseStatus } from '../types/enums';
import { AuditLogService } from './auditLog.service';

interface SubmitInput {
  description: string;
  fileUrls: string[];
  submitterId: string;
}

@Injectable()
export class DesignService {
  constructor(
    @InjectRepository(DesignPhase) private readonly repo: Repository<DesignPhase>,
    @InjectRepository(DesignSubmission) private readonly submissionRepo: Repository<DesignSubmission>,
    private readonly auditLog: AuditLogService
  ) {}

  async findAll() {
    const phases = await this.repo.find({
      relations: { project: true, submissions: true },
      order: { version: 'DESC', submissions: { version: 'DESC' } }
    });
    return phases.map((phase) => this.decoratePhase(phase));
  }

  async findSubmissions(phaseId: string) {
    const phase = await this.repo.findOne({
      where: { id: phaseId },
      relations: { submissions: true },
      order: { submissions: { version: 'DESC' } }
    });
    if (!phase) {
      throw new NotFoundException('设计阶段不存在');
    }
    return phase.submissions;
  }

  // 每次提交都新增一条不可变版本记录，旧版本及其审核意见保留
  async submit(phaseId: string, userId: string, input: SubmitInput) {
    const description = input.description?.trim();
    const fileUrls = (input.fileUrls ?? []).map((url) => url?.trim()).filter(Boolean);
    if (!description || fileUrls.length === 0) {
      throw new BadRequestException('设计说明和附件地址均不能为空');
    }

    const phase = await this.repo.findOne({
      where: { id: phaseId },
      relations: { submissions: true }
    });
    if (!phase) {
      throw new NotFoundException('设计阶段不存在');
    }

    // 已通过的阶段不允许再次提交；仅未开始或被驳回后可提交新版本
    if (phase.status === PhaseStatus.Approved) {
      throw new BadRequestException('当前版本已审核通过，不能重复提交');
    }

    const nextVersion = phase.submissions.length
      ? Math.max(...phase.submissions.map((item) => item.version)) + 1
      : 1;

    const submission = this.submissionRepo.create({
      phaseId,
      version: nextVersion,
      description,
      fileUrls,
      status: PhaseStatus.InProgress,
      submitterId: input.submitterId?.trim() || userId
    });
    const saved = await this.submissionRepo.save(submission);

    phase.status = PhaseStatus.InProgress;
    phase.version = nextVersion;
    phase.description = description;
    phase.fileUrls = fileUrls;
    phase.reviewComment = undefined;
    phase.reviewerId = undefined;
    await this.repo.save(phase);

    await this.auditLog.record({ userId, action: 'submit_design', entity: 'DesignSubmission', entityId: saved.id });
    return saved;
  }

  // 业主只审核当前待审版本，驳回意见随该版本保留
  async review(phaseId: string, approved: boolean, comment: string, reviewerId: string) {
    const current = await this.submissionRepo.findOne({
      where: { phaseId, status: PhaseStatus.InProgress },
      order: { version: 'DESC' }
    });
    if (!current) {
      throw new NotFoundException('当前没有待审核的提交版本');
    }

    current.status = approved ? PhaseStatus.Approved : PhaseStatus.Revision;
    current.reviewComment = comment;
    current.reviewerId = reviewerId;
    current.reviewedAt = new Date();
    const saved = await this.submissionRepo.save(current);

    const phase = await this.repo.findOneByOrFail({ id: phaseId });
    phase.status = current.status;
    phase.reviewComment = comment;
    phase.reviewerId = reviewerId;
    await this.repo.save(phase);

    await this.auditLog.record({ userId: reviewerId, action: approved ? 'approve_design' : 'reject_design', entity: 'DesignSubmission', entityId: saved.id });
    return saved;
  }

  // 当前版本：已提交版本中版本号最大的一条；旧版本通过 submissions 回看
  private decoratePhase(phase: DesignPhase & { submissions?: DesignSubmission[] }) {
    const submissions = [...(phase.submissions ?? [])].sort((a, b) => b.version - a.version);
    const currentSubmission = submissions[0];
    return {
      ...phase,
      submissions,
      currentVersion: currentSubmission?.version ?? phase.version,
      currentSubmissionId: currentSubmission?.id ?? null
    };
  }
}
