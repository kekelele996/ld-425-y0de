import { Card, Typography } from 'antd';
import { useEffect } from 'react';
import { PhaseCard } from '../components/design/PhaseCard';
import { StepIndicator } from '../components/common/StepIndicator';
import { useDesignStore } from '../stores/designStore';

export function DesignManage() {
  const { designs, fetchDesigns } = useDesignStore();

  useEffect(() => {
    void fetchDesigns();
  }, [fetchDesigns]);

  return (
    <div>
      <Typography.Title level={2}>设计管理</Typography.Title>
      <Card className="section">
        <StepIndicator phases={designs} />
      </Card>
      <div className="grid section">
        {designs.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
