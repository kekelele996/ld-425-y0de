import { Form, Input, Button, Space } from 'antd';
import { useState } from 'react';
import { SubmitDesignPayload } from '../../types';

interface Props {
  // 用于回显上一次被驳回版本的内容，方便修改后重新提交
  initialDescription?: string;
  initialFileUrl?: string;
  submitting?: boolean;
  onSubmit: (payload: SubmitDesignPayload) => Promise<void> | void;
}

// 每次提交都需要独立填写说明与附件地址；任一为空则不允许提交
export function DesignSubmitForm({ initialDescription = '', initialFileUrl = '', submitting, onSubmit }: Props) {
  const [form] = Form.useForm<{ description: string; fileUrl: string }>();
  const [description, setDescription] = useState(initialDescription);
  const [fileUrl, setFileUrl] = useState(initialFileUrl);

  const valid = description.trim().length > 0 && fileUrl.trim().length > 0;

  const handleFinish = async () => {
    await onSubmit({ description: description.trim(), fileUrls: [fileUrl.trim()] });
    form.resetFields();
    setDescription('');
    setFileUrl('');
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item label="设计说明" required>
        <Input.TextArea
          rows={2}
          placeholder="填写本次提交的版本说明"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Form.Item>
      <Form.Item label="附件地址" required>
        <Input
          placeholder="例如 /uploads/construction-v3.pdf"
          value={fileUrl}
          onChange={(event) => setFileUrl(event.target.value)}
        />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={submitting} disabled={!valid}>
          提交新版本
        </Button>
        {!valid && <span style={{ color: '#999' }}>说明和附件地址填写完整后才能提交</span>}
      </Space>
    </Form>
  );
}
