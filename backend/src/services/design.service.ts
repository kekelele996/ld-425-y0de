import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignPhase } from '../models/designPhase.entity';
import { DesignVersion } from '../models/designVersion.entity';
import { PhaseStatus, VersionReviewStatus } from '../types/enums';
import { AuditLogService } from './auditLog.service';

@Injectable()
export class DesignService {
  constructor(
    @InjectRepository(DesignPhase) private readonly repo: Repository<DesignPhase>,
    @InjectRepository(DesignVersion) private readonly versionRepo: Repository<DesignVersion>,
    private readonly auditLog: AuditLogService
  ) {}

  findAll() {
    return this.repo.find({ relations: ['project'], order: { version: 'DESC' } });
  }

  findVersions(phaseId: string) {
    return this.versionRepo.find({ where: { phaseId }, order: { version: 'DESC' } });
  }

  async submit(id: string, description: string, fileUrls: string[], userId: string) {
    const phase = await this.repo.findOneByOrFail({ id });
    const trimmed = description?.trim() ?? '';
    const urls = (fileUrls ?? []).map((url) => url.trim()).filter(Boolean);
    if (!trimmed || urls.length === 0) {
      throw new BadRequestException('设计说明和附件地址不能为空，无法提交');
    }
    const versionNo = phase.version + 1;
    await this.versionRepo.save(this.versionRepo.create({
      phaseId: id,
      version: versionNo,
      description: trimmed,
      fileUrls: urls,
      status: VersionReviewStatus.Pending
    }));
    phase.version = versionNo;
    phase.status = PhaseStatus.InProgress;
    phase.description = trimmed;
    phase.fileUrls = urls;
    phase.reviewComment = null;
    phase.reviewerId = null;
    await this.auditLog.record({ userId, action: 'submit_design', entity: 'DesignPhase', entityId: id, detail: `提交 v${versionNo}` });
    return this.repo.save(phase);
  }

  async review(id: string, approved: boolean, comment: string, reviewerId: string) {
    const phase = await this.repo.findOneByOrFail({ id });
    const version = await this.versionRepo.findOne({ where: { phaseId: id, version: phase.version } });
    if (!version || version.status !== VersionReviewStatus.Pending) {
      throw new BadRequestException('当前没有待审核的版本');
    }
    const trimmed = comment?.trim() ?? '';
    if (!approved && !trimmed) {
      throw new BadRequestException('驳回时必须填写审核意见');
    }
    version.status = approved ? VersionReviewStatus.Approved : VersionReviewStatus.Rejected;
    version.reviewComment = trimmed || null;
    version.reviewerId = reviewerId;
    version.reviewedAt = new Date();
    await this.versionRepo.save(version);
    phase.status = approved ? PhaseStatus.Approved : PhaseStatus.Revision;
    phase.reviewComment = version.reviewComment;
    phase.reviewerId = reviewerId;
    await this.auditLog.record({ userId: reviewerId, action: approved ? 'approve_design' : 'reject_design', entity: 'DesignPhase', entityId: id, detail: `审核 v${version.version}` });
    return this.repo.save(phase);
  }
}
