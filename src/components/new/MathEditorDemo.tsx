import React, { useState } from 'react';
import SimpleMathEditor from './SimpleMathEditor';

const MathEditorDemo = () => {
  const [content, setContent] = useState("Start typing here. Press $ to enter a math equation like $E=mc^2$");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            ✨ Super Simple Math Editor ✨
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        <div className="mb-6">
          <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            💅 Just type $ to start a math equation anywhere in your text!
          </p>
          <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            👆 Click on any rendered equation to edit it
          </p>
        </div>
        
        <SimpleMathEditor
          initialValue={content}
          onChange={setContent}
          darkMode={isDarkMode}
          className="mb-8"
        />
        
        <div className="mt-8">
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Raw Content:
          </h2>
          <pre 
            className={`p-4 rounded-md overflow-auto text-sm ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MathEditorDemo; 