import { Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface ReviewDesignModalProps {
  open: boolean;
  approved: boolean;
  version: number;
  onCancel: () => void;
  onSubmit: (comment: string) => Promise<void>;
}

export function ReviewDesignModal({ open, approved, version, onCancel, onSubmit }: ReviewDesignModalProps) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setComment('');
    }
  }, [open]);

  const valid = approved || comment.trim().length > 0;

  const handleOk = async () => {
    setSubmitting(true);
    try {
      await onSubmit(comment.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={approved ? `通过 v${version}` : `驳回 v${version}`}
      open={open}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText="确认"
      cancelText="取消"
      confirmLoading={submitting}
      okButtonProps={{ disabled: !valid, danger: !approved }}
    >
      <Typography.Text strong>审核意见{approved ? '（选填）' : ' *'}</Typography.Text>
      <Input.TextArea
        rows={3}
        placeholder={approved ? '通过意见（选填）' : '驳回原因将跟随该版本保留'}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ marginTop: 4 }}
      />
      {!approved && !valid && <Typography.Text type="secondary">驳回时必须填写审核意见。</Typography.Text>}
    </Modal>
  );
}
