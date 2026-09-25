import { Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface SubmitDesignModalProps {
  open: boolean;
  nextVersion: number;
  onCancel: () => void;
  onSubmit: (description: string, fileUrls: string[]) => Promise<void>;
}

export function SubmitDesignModal({ open, nextVersion, onCancel, onSubmit }: SubmitDesignModalProps) {
  const [description, setDescription] = useState('');
  const [urlsText, setUrlsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDescription('');
      setUrlsText('');
    }
  }, [open]);

  const fileUrls = urlsText.split('\n').map((url) => url.trim()).filter(Boolean);
  const valid = description.trim().length > 0 && fileUrls.length > 0;

  const handleOk = async () => {
    setSubmitting(true);
    try {
      await onSubmit(description.trim(), fileUrls);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`提交设计（将生成 v${nextVersion}）`}
      open={open}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText="提交"
      cancelText="取消"
      confirmLoading={submitting}
      okButtonProps={{ disabled: !valid }}
    >
      <Typography.Text strong>设计说明 *</Typography.Text>
      <Input.TextArea
        rows={3}
        placeholder="本次提交的修改说明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginTop: 4, marginBottom: 12 }}
      />
      <Typography.Text strong>附件地址 *（每行一个）</Typography.Text>
      <Input.TextArea
        rows={3}
        placeholder={'/uploads/construction-v3.pdf\n/uploads/nodes-v3.pdf'}
        value={urlsText}
        onChange={(e) => setUrlsText(e.target.value)}
        style={{ marginTop: 4 }}
      />
      {!valid && <Typography.Text type="secondary">设计说明与附件地址均不能为空，否则无法提交。</Typography.Text>}
    </Modal>
  );
}
