import React from 'react';
import { ChevronLeft, ChevronRight, Home, List, Maximize2, Minimize2 } from 'lucide-react';

interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoHome: () => void;
  onToggleContents: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoHome,
  onToggleContents,
  onToggleFullscreen,
  isFullscreen,
  canGoBack,
  canGoForward
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Home button */}
          <button
            onClick={onGoHome}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all duration-200"
            title="Back to cover"
          >
            <Home size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Table of contents */}
          <button
            onClick={onToggleContents}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all duration-200"
            title="Table of contents"
          >
            <List size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <div className="w-px h-4 sm:h-6 bg-gray-300"></div>

          {/* Previous page */}
          <button
            onClick={onPrevPage}
            disabled={!canGoBack}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>

          {/* Page counter */}
          <div className="px-2 py-1 sm:px-3 sm:py-1 bg-amber-50 rounded-full text-xs sm:text-sm font-medium text-amber-800 min-w-[60px] sm:min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </div>

          {/* Next page */}
          <button
            onClick={onNextPage}
            disabled={!canGoForward}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>

          <div className="w-px h-4 sm:h-6 bg-gray-300"></div>

          {/* Fullscreen toggle - hidden on mobile */}
          <button
            onClick={onToggleFullscreen}
            className="hidden sm:block p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all duration-200"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};