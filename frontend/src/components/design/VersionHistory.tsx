import { List, Space, Tag, Typography } from 'antd';
import { DesignVersion, VersionReviewStatus } from '../../types';
import { VersionTag } from '../common/VersionTag';
import { EmptyState } from '../common/EmptyState';

const statusMeta: Record<VersionReviewStatus, { color: string; label: string }> = {
  [VersionReviewStatus.Pending]: { color: 'processing', label: '待审核' },
  [VersionReviewStatus.Approved]: { color: 'success', label: '已通过' },
  [VersionReviewStatus.Rejected]: { color: 'error', label: '已驳回' }
};

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-';
}

interface VersionHistoryProps {
  versions: DesignVersion[];
  currentVersion: number;
}

export function VersionHistory({ versions, currentVersion }: VersionHistoryProps) {
  if (versions.length === 0) {
    return <EmptyState description="暂无版本记录" />;
  }
  return (
    <List
      dataSource={versions}
      renderItem={(item) => {
        const isCurrent = item.version === currentVersion;
        const meta = statusMeta[item.status];
        return (
          <List.Item
            style={{
              padding: 12,
              borderRadius: 8,
              background: isCurrent ? '#e6f4ff' : undefined,
              border: isCurrent ? '1px solid #91caff' : '1px solid transparent'
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <VersionTag version={item.version} />
                {isCurrent && <Tag color="blue">当前版本</Tag>}
                <Tag color={meta.color}>{meta.label}</Tag>
                <Typography.Text type="secondary">提交于 {formatTime(item.submittedAt)}</Typography.Text>
              </Space>
              <span>{item.description}</span>
              <Space wrap>
                {item.fileUrls.map((url) => (
                  <Typography.Link key={url} href={url} target="_blank">{url}</Typography.Link>
                ))}
              </Space>
              {item.reviewComment && (
                <Typography.Text type={item.status === VersionReviewStatus.Rejected ? 'danger' : undefined}>
                  审核意见：{item.reviewComment}（{formatTime(item.reviewedAt)}）
                </Typography.Text>
              )}
            </Space>
          </List.Item>
        );
      }}
    />
  );
}
