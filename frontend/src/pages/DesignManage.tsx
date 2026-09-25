import { Card, Collapse, Space, Tabs, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { DesignReviewPanel } from '../components/design/DesignReviewPanel';
import { DesignSubmitForm } from '../components/design/DesignSubmitForm';
import { DesignVersionHistory } from '../components/design/DesignVersionHistory';
import { StatusBadge } from '../components/common/StatusBadge';
import { StepIndicator } from '../components/common/StepIndicator';
import { VersionTag } from '../components/common/VersionTag';
import { useProjectPhase } from '../hooks/useProjectPhase';
import { useDesignStore } from '../stores/designStore';
import { DesignPhase } from '../types';

function PhaseCard({ phase }: { phase: DesignPhase }) {
  const { submitDesign, reviewDesign } = useDesignStore();
  const [busy, setBusy] = useState(false);
  const state = useProjectPhase(phase.status);

  // 最新一条即当前版本；被驳回时可将其内容带入提交表单重新提交
  const current = phase.submissions[0];
  const rejectedPrefill = current?.status === 'Revision'
    ? { initialDescription: current.description, initialFileUrl: current.fileUrls[0] ?? '' }
    : {};

  const handleSubmit = async (payload: { description: string; fileUrls: string[] }) => {
    setBusy(true);
    try {
      await submitDesign(phase.id, payload);
      message.success(`v${phase.currentVersion + 1} 已提交，等待业主审核`);
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (approved: boolean, comment: string) => {
    setBusy(true);
    try {
      await reviewDesign(phase.id, approved, comment);
      message.success(approved ? '已通过当前版本' : '已驳回当前版本，意见已随版本保留');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title={
        <Space wrap>
          <span>{phase.name}</span>
          <VersionTag version={phase.currentVersion} />
          <StatusBadge status={phase.status} />
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: 'current',
            label: '当前版本',
            children: (
              <Space direction="vertical" size={16} style={{ display: 'flex' }}>
                {current ? (
                  <Card
                    size="small"
                    type="inner"
                    title={
                      <Space wrap>
                        <VersionTag version={current.version} />
                        <StatusBadge status={current.status} />
                      </Space>
                    }
                    style={{ borderColor: '#1677ff' }}
                  >
                    <Typography.Paragraph>{current.description}</Typography.Paragraph>
                    <Space direction="vertical" size={4}>
                      {current.fileUrls.map((url) => (
                        <Typography.Link key={url} href={url} target="_blank" rel="noreferrer">
                          {url}
                        </Typography.Link>
                      ))}
                    </Space>
                    {current.reviewComment && (
                      <Typography.Paragraph
                        type={current.status === 'Revision' ? 'danger' : 'success'}
                        style={{ marginTop: 12, marginBottom: 0 }}
                      >
                        审核意见（v{current.version}）：{current.reviewComment}
                      </Typography.Paragraph>
                    )}
                  </Card>
                ) : (
                  <Typography.Text type="secondary">尚未提交过版本</Typography.Text>
                )}

                {state.canSubmit && (
                  <Card size="small" type="inner" title="提交新版本">
                    <DesignSubmitForm submitting={busy} onSubmit={handleSubmit} {...rejectedPrefill} />
                  </Card>
                )}

                {state.canReview && current && (
                  <Card size="small" type="inner" title={`业主审核（当前 v${current.version}）`}>
                    <DesignReviewPanel version={current.version} reviewing={busy} onReview={handleReview} />
                  </Card>
                )}
              </Space>
            )
          },
          {
            key: 'history',
            label: `历史版本（${phase.submissions.length}）`,
            children: (
              <DesignVersionHistory submissions={phase.submissions} currentSubmissionId={phase.currentSubmissionId} />
            )
          }
        ]}
      />
    </Card>
  );
}

export function DesignManage() {
  const { designs, fetchDesigns } = useDesignStore();

  useEffect(() => {
    void fetchDesigns();
  }, [fetchDesigns]);

  const steps = useMemo(
    () => designs.map((phase) => ({ ...phase, version: phase.currentVersion })),
    [designs]
  );

  return (
    <div>
      <Typography.Title level={2}>设计管理</Typography.Title>
      <Card className="section">
        <StepIndicator phases={steps} />
      </Card>
      <Collapse
        className="section"
        defaultActiveKey={designs.map((phase) => phase.id)}
        items={designs.map((phase) => ({
          key: phase.id,
          label: (
            <Space wrap>
              <span>{phase.name}</span>
              <VersionTag version={phase.currentVersion} />
              <StatusBadge status={phase.status} />
            </Space>
          ),
          children: <PhaseCard phase={phase} />
        }))}
      />
    </div>
  );
}
