import React, { useState } from 'react';
import { Exercise } from '@/components/ExerciseEditor/types';
import ExerciseEditor from '@/components/ExerciseEditor/ExerciseEditor';

const ExerciseEditorPage: React.FC = () => {
  const [exercise, setExercise] = useState<Exercise>({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Untitled Exercise',
    blocks: []
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <ExerciseEditor
          exercise={exercise}
          onChange={setExercise}
          darkMode={false}
        />
      </div>
    </div>
  );
};

export default ExerciseEditorPage; 