
import React from 'react';
import ActionCard from './ActionCard';
import { FileText, Pencil, AlertCircle } from 'lucide-react';

const ActionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-xl mx-auto">
      <ActionCard
        icon="📋"
        title="Generate Report"
        delay={0.3}
      />
      <ActionCard
        icon="✏️"
        title="Generate Exercises"
        delay={0.4}
      />
      <ActionCard
        icon="❗"
        title="Prepare an Exam"
        delay={0.5}
      />
    </div>
  );
};

export default ActionCards;
