import React from 'react';

interface BookCoverProps {
  title: string;
  author: string;
  subtitle?: string;
  coverImage?: string;
  onOpen: () => void;
}

export const BookCover: React.FC<BookCoverProps> = ({ title, author, subtitle, coverImage, onOpen }) => {
  if (coverImage) {
    // Cover with featured image - no text overlay
    return (
      <div 
        className="w-full h-full rounded-r-lg shadow-2xl cursor-pointer transform transition-all duration-300 
                   hover:shadow-3xl hover:scale-105 border-l-4 border-amber-600 relative overflow-hidden"
        onClick={onOpen}
      >
        {/* Cover image only */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${coverImage})`
          }}
        />
        
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300" />
        
        {/* Click indicator - only visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-gray-800 text-sm font-medium">Click to open</span>
          </div>
        </div>
      </div>
    );
  }

  // Default cover design (no image) - keep text
  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 
                 rounded-r-lg shadow-2xl cursor-pointer transform transition-all duration-300 
                 hover:shadow-3xl hover:scale-105 border-l-4 border-amber-600"
      onClick={onOpen}
    >
      <div className="h-full p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between text-amber-50">
        <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-200/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-8 sm:w-8 sm:h-10 bg-amber-200 rounded-sm"></div>
          </div>
        </div>
        
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight font-serif tracking-wide">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light italic text-amber-200 leading-relaxed px-2">
              {subtitle}
            </p>
          )}
          
          <div className="w-16 sm:w-20 lg:w-24 h-px bg-amber-300 mx-auto opacity-60"></div>
          
          <p className="text-base sm:text-lg lg:text-xl font-light text-amber-200">
            {author}
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-amber-200 text-xs sm:text-sm">
            <span>Click to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};