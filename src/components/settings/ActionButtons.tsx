
import React from 'react';

interface ActionButtonsProps {
  onCancel: () => void;
  onSave: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSave,
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      <button
        onClick={onCancel}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg backdrop-blur-sm"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
      >
        Save Changes
      </button>
    </div>
  );
};

export default ActionButtons;
