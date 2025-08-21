import React from 'react';
import { X } from 'lucide-react';
import { Chapter } from '../types/book';

interface TableOfContentsProps {
  chapters: Chapter[];
  currentPage: number;
  onChapterSelect: (pageNumber: number) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  currentPage,
  onChapterSelect,
  onClose,
  isVisible
}) => {
  if (!isVisible) return null;

  // Helper function to determine if a chapter is currently active
  const isCurrentChapter = (chapter: Chapter, index: number) => {
    const nextChapter = chapters[index + 1];
    return currentPage >= chapter.pageNumber && 
           (!nextChapter || currentPage < nextChapter.pageNumber);
  };

  // Helper function to get indentation based on heading level
  const getIndentation = (level: number) => {
    const baseIndent = 0;
    const indentPerLevel = 16; // 16px per level
    return baseIndent + (level - 2) * indentPerLevel;
  };

  // Helper function to get text size based on heading level
  const getTextSize = (level: number) => {
    switch (level) {
      case 2: return 'text-base font-semibold';
      case 3: return 'text-sm font-medium';
      case 4: return 'text-sm font-normal';
      case 5: return 'text-xs font-normal';
      case 6: return 'text-xs font-light';
      default: return 'text-base font-medium';
    }
  };

  // Helper function to get bullet style based on heading level
  const getBulletStyle = (level: number) => {
    switch (level) {
      case 2: return 'w-2 h-2 bg-amber-500 rounded-full';
      case 3: return 'w-1.5 h-1.5 bg-amber-400 rounded-full';
      case 4: return 'w-1 h-1 bg-amber-300 rounded-full';
      default: return 'w-1 h-1 bg-amber-200 rounded-full';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <h2 className="text-2xl font-bold text-amber-900 font-serif">Table of Contents</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-1">
            {chapters.map((chapter, index) => {
              const isCurrent = isCurrentChapter(chapter, index);
              const indentPx = getIndentation(chapter.level);
              const textClass = getTextSize(chapter.level);
              const bulletClass = getBulletStyle(chapter.level);
              
              return (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onChapterSelect(chapter.pageNumber);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-amber-50 hover:border-amber-200 border border-transparent group ${
                    isCurrent
                      ? 'bg-amber-100 border-amber-200 text-amber-900'
                      : 'text-gray-700 hover:text-amber-800'
                  }`}
                  style={{ paddingLeft: `${12 + indentPx}px` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-3">
                        <div className={bulletClass}></div>
                        <span className={`${textClass} leading-relaxed ${
                          isCurrent ? 'text-amber-900' : 'text-gray-800 group-hover:text-amber-800'
                        }`}>
                          {chapter.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-xs font-medium ${
                        isCurrent ? 'text-amber-700' : 'text-gray-500 group-hover:text-amber-600'
                      }`}>
                        {chapter.pageNumber}
                      </span>
                      {isCurrent && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Click any section to jump to that page
          </p>
        </div>
      </div>
    </div>
  );
};