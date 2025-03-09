
import React from 'react';
import ActionCard from './ActionCard';
import { FileText, PenSquare, AlertTriangle } from 'lucide-react';

const ActionCards = () => {
  // Check current theme directly from the DOM
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-xl mx-auto">
      <ActionCard
        icon={<FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} theme-change-immediate`} />}
        title="Generate Report"
        delay={0.3}
      />
      <ActionCard
        icon={<PenSquare className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'} theme-change-immediate`} />}
        title="Generate Exercises"
        delay={0.4}
      />
      <ActionCard
        icon={<AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'} theme-change-immediate`} />}
        title="Prepare an Exam"
        delay={0.5}
      />
    </div>
  );
};

export default ActionCards;
