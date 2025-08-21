import React from 'react';

interface BookPageProps {
  content: string;
  pageNumber: number;
  isVisible: boolean;
  side: 'left' | 'right';
  isMobile?: boolean;
  bookTitle?: string;
  bookAuthor?: string;
}

export const BookPage: React.FC<BookPageProps> = ({ 
  content, 
  pageNumber, 
  isVisible, 
  side,
  isMobile = false,
  bookTitle,
  bookAuthor
}) => {
  return (
    <div
      className={`
        absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 
        border border-amber-200 shadow-lg transform-gpu transition-all duration-700
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${side === 'left' ? 'origin-right' : 'origin-left'}
        ${isMobile ? 'rounded-lg' : ''}
        overflow-hidden
      `}
      style={{
        transform: isVisible ? 'rotateY(0deg)' : `rotateY(${side === 'left' ? '-180deg' : '180deg'})`,
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="h-full flex flex-col">
        {/* Header with running title and author - like real books */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 lg:px-10 lg:py-6 flex-shrink-0">
          <div className="flex justify-between items-center text-xs sm:text-sm text-amber-700 font-medium opacity-60">
            <span className="truncate">
              {bookTitle && pageNumber > 1 ? bookTitle : ''}
            </span>
            <span className="truncate ml-2">
              {bookAuthor && pageNumber > 1 ? bookAuthor : ''}
            </span>
          </div>
          {pageNumber > 1 && <div className="w-full h-px bg-amber-200 mt-2"></div>}
        </div>

        {/* Main content area - constrained to prevent overflow */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 pb-4 sm:pb-6 md:pb-8 lg:pb-10 overflow-hidden">
          <div 
            className="h-full text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed font-serif overflow-hidden"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
};