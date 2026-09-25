import { Button, Input, Space } from 'antd';
import { useState } from 'react';

interface Props {
  version: number;
  reviewing?: boolean;
  onReview: (approved: boolean, comment: string) => Promise<void> | void;
}

// 业主只审核当前待审版本，提交的意见随该版本永久保留
export function DesignReviewPanel({ version, reviewing, onReview }: Props) {
  const [comment, setComment] = useState('');

  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <Input.TextArea
        rows={2}
        placeholder={`填写对 v${version} 的审核意见`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <Space>
        <Button
          type="primary"
          loading={reviewing}
          onClick={() => onReview(true, comment.trim() || '方案确认通过')}
        >
          业主通过
        </Button>
        <Button
          danger
          loading={reviewing}
          disabled={comment.trim().length === 0}
          onClick={() => onReview(false, comment.trim())}
        >
          驳回修改
        </Button>
      </Space>
    </Space>
  );
}
