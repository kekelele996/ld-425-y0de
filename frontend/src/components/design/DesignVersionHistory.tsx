import { Card, Empty, Space, Tag, Typography } from 'antd';
import { PhaseStatus } from '../../types';
import { DesignSubmission } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { VersionTag } from '../common/VersionTag';

interface Props {
  submissions: DesignSubmission[];
  currentSubmissionId: string | null;
}

function formatTime(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

// 全部历史版本均保留，审核意见跟着对应版本走；当前待审/最新版本突出显示
export function DesignVersionHistory({ submissions, currentSubmissionId }: Props) {
  if (submissions.length === 0) {
    return <Empty description="暂无提交版本" />;
  }

  return (
    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
      {submissions.map((item) => {
        const isCurrent = item.id === currentSubmissionId;
        const isPending = item.status === PhaseStatus.InProgress;
        return (
          <Card
            key={item.id}
            size="small"
            style={isCurrent ? { borderColor: '#1677ff', boxShadow: '0 0 0 2px rgba(22,119,255,0.15)' } : undefined}
            title={
              <Space wrap>
                <VersionTag version={item.version} />
                <StatusBadge status={item.status} />
                {isCurrent && <Tag color="blue">当前版本</Tag>}
                {isPending && <Tag color="processing">待业主审核</Tag>}
              </Space>
            }
          >
            <Space direction="vertical" size={4} style={{ display: 'flex' }}>
              <Typography.Text>{item.description}</Typography.Text>
              <Space wrap>
                {item.fileUrls.map((url) => (
                  <Typography.Link key={url} href={url} target="_blank" rel="noreferrer">
                    {url}
                  </Typography.Link>
                ))}
              </Space>
              <Typography.Text type="secondary">提交时间：{formatTime(item.submittedAt)}</Typography.Text>
              {item.reviewComment ? (
                <div>
                  <Typography.Text type={item.status === PhaseStatus.Revision ? 'danger' : 'success'}>
                    审核意见（v{item.version}）：{item.reviewComment}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                    {formatTime(item.reviewedAt)}
                  </Typography.Text>
                </div>
              ) : (
                <Typography.Text type="secondary">暂无审核意见</Typography.Text>
              )}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}
