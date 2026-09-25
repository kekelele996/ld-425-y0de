import { Button, Card, Collapse, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useProjectPhase } from '../../hooks/useProjectPhase';
import { useDesignStore } from '../../stores/designStore';
import { DesignPhase } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { VersionTag } from '../common/VersionTag';
import { ReviewDesignModal } from './ReviewDesignModal';
import { SubmitDesignModal } from './SubmitDesignModal';
import { VersionHistory } from './VersionHistory';

export function PhaseCard({ phase }: { phase: DesignPhase }) {
  const { versionsByPhase, fetchVersions, submitDesign, reviewDesign } = useDesignStore();
  const state = useProjectPhase(phase.status);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewApproved, setReviewApproved] = useState<boolean | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (historyOpen) {
      void fetchVersions(phase.id);
    }
  }, [historyOpen, phase.id, fetchVersions]);

  const handleSubmit = async (description: string, fileUrls: string[]) => {
    try {
      await submitDesign(phase.id, description, fileUrls);
      message.success(`已提交 v${phase.version + 1}，等待业主审核`);
      setSubmitOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '提交失败');
    }
  };

  const handleReview = async (comment: string) => {
    if (reviewApproved === null) {
      return;
    }
    try {
      await reviewDesign(phase.id, reviewApproved, comment);
      message.success(reviewApproved ? '已通过当前版本' : '已驳回，意见已随该版本保留');
      setReviewApproved(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '审核失败');
    }
  };

  return (
    <Card
      title={phase.name}
      extra={<VersionTag version={phase.version} />}
      style={state.canReview ? { border: '1px solid #1677ff', boxShadow: '0 2px 8px rgba(22,119,255,0.15)' } : undefined}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <StatusBadge status={phase.status} />
          {state.canReview && <span style={{ color: '#1677ff' }}>当前版本待审核</span>}
        </Space>
        <span>{phase.description}</span>
        <Space wrap>
          <Button disabled={!state.canSubmit} onClick={() => setSubmitOpen(true)}>提交设计</Button>
          <Button disabled={!state.canReview} type="primary" onClick={() => setReviewApproved(true)}>业主通过</Button>
          <Button disabled={!state.canReview} danger onClick={() => setReviewApproved(false)}>驳回修改</Button>
        </Space>
        <Collapse
          ghost
          activeKey={historyOpen ? ['history'] : []}
          onChange={(keys) => setHistoryOpen(keys.includes('history'))}
          items={[{
            key: 'history',
            label: '版本历史',
            children: <VersionHistory versions={versionsByPhase[phase.id] ?? []} currentVersion={phase.version} />
          }]}
        />
      </Space>
      <SubmitDesignModal
        open={submitOpen}
        nextVersion={phase.version + 1}
        onCancel={() => setSubmitOpen(false)}
        onSubmit={handleSubmit}
      />
      <ReviewDesignModal
        open={reviewApproved !== null}
        approved={reviewApproved ?? true}
        version={phase.version}
        onCancel={() => setReviewApproved(null)}
        onSubmit={handleReview}
      />
    </Card>
  );
}
