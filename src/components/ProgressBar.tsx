import React from 'react';

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentPage, totalPages }) => {
  const progress = (currentPage / totalPages) * 100;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-64 z-20">
      <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};