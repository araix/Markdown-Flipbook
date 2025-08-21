import React, { useState, useEffect, useCallback } from 'react';
import { BookPage } from './BookPage';
import { BookCover } from './BookCover';
import { NavigationControls } from './NavigationControls';
import { TableOfContents } from './TableOfContents';
import { ProgressBar } from './ProgressBar';
import { PurchaseModal } from './PurchaseModal';
import { BookData } from '../types/book';

interface BookReaderProps {
  bookData: BookData;
}

export const BookReader: React.FC<BookReaderProps> = ({ bookData }) => {
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover
  const [showCover, setShowCover] = useState(true);
  const [showContents, setShowContents] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openBook = () => {
    setShowCover(false);
    setCurrentPage(1);
  };

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber === 0) {
      setShowCover(true);
      setCurrentPage(0);
    } else {
      setShowCover(false);
      setCurrentPage(Math.max(1, Math.min(pageNumber, bookData.totalPages)));
    }
  }, [bookData.totalPages]);

  const nextPage = () => {
    if (currentPage < bookData.totalPages) {
      const newPage = currentPage + 1;
      goToPage(newPage);
      
      // Show purchase modal on last page if purchase info exists
      if (newPage === bookData.totalPages && bookData.purchaseInfo) {
        setTimeout(() => setShowPurchaseModal(true), 1000);
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    } else if (currentPage === 1) {
      goToPage(0); // Back to cover
    }
  };

  const goHome = () => {
    goToPage(0);
    setShowPurchaseModal(false);
  };

  const toggleContents = () => {
    setShowContents(!showContents);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showContents || showPurchaseModal) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'Home':
          e.preventDefault();
          goHome();
          break;
        case 'Escape':
          if (showContents) {
            setShowContents(false);
          } else if (showPurchaseModal) {
            setShowPurchaseModal(false);
          } else if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, showContents, showPurchaseModal, isFullscreen]);

  // Handle touch/swipe for mobile
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        nextPage(); // Swipe left = next page
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        prevPage(); // Swipe right = previous page
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, currentPage]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getCurrentPageData = () => {
    return bookData.pages.find(page => page.id === currentPage);
  };

  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < bookData.totalPages;

  return (
    <div className={`relative w-full h-screen bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23d97706%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      {/* Main book container - Made bigger */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          perspective: '1000px',
          width: isMobile 
            ? 'min(380px, 92vw)' 
            : showCover 
              ? 'min(600px, 90vw)' 
              : 'min(1200px, 95vw)', // Increased width significantly
          height: isMobile 
            ? 'min(550px, 85vh)' 
            : 'min(800px, 90vh)', // Increased height
          transition: 'width 0.7s ease-in-out'
        }}
      >
        {showCover ? (
          <BookCover
            title={bookData.title}
            author={bookData.author}
            subtitle={bookData.subtitle}
            coverImage={bookData.coverImage}
            onOpen={openBook}
          />
        ) : (
          <div className="relative w-full h-full">
            {isMobile ? (
              // Mobile: Single page view
              <div className="relative w-full h-full">
                <BookPage
                  content={getCurrentPageData()?.content || ''}
                  pageNumber={currentPage}
                  isVisible={true}
                  side="right"
                  isMobile={true}
                  bookTitle={bookData.title}
                  bookAuthor={bookData.author}
                />
                
                {/* Stacked pages effect for mobile */}
                {currentPage < bookData.totalPages && (
                  <>
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-md"
                      style={{ 
                        transform: 'translateZ(-2px) translateX(2px) translateY(2px)',
                        zIndex: -1,
                        opacity: 0.8
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm"
                      style={{ 
                        transform: 'translateZ(-4px) translateX(4px) translateY(4px)',
                        zIndex: -2,
                        opacity: 0.6
                      }}
                    />
                  </>
                )}
              </div>
            ) : (
              // Desktop: Two page spread
              <>
                {/* Left page */}
                <div className="absolute left-0 top-0 w-1/2 h-full">
                  {currentPage > 1 && (
                    <BookPage
                      content={bookData.pages.find(p => p.id === currentPage - 1)?.content || ''}
                      pageNumber={currentPage - 1}
                      isVisible={true}
                      side="left"
                      bookTitle={bookData.title}
                      bookAuthor={bookData.author}
                    />
                  )}
                </div>

                {/* Right page */}
                <div className="absolute right-0 top-0 w-1/2 h-full">
                  <BookPage
                    content={getCurrentPageData()?.content || ''}
                    pageNumber={currentPage}
                    isVisible={true}
                    side="right"
                    bookTitle={bookData.title}
                    bookAuthor={bookData.author}
                  />
                </div>

                {/* Book spine */}
                <div className="absolute left-1/2 top-0 w-1 h-full bg-amber-800 transform -translate-x-1/2 shadow-lg z-10"></div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!showCover && (
        <ProgressBar currentPage={currentPage} totalPages={bookData.totalPages} />
      )}

      {/* Navigation controls */}
      {!showCover && (
        <NavigationControls
          currentPage={currentPage}
          totalPages={bookData.totalPages}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onGoHome={goHome}
          onToggleContents={toggleContents}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      )}

      {/* Table of contents */}
      <TableOfContents
        chapters={bookData.chapters}
        currentPage={currentPage}
        onChapterSelect={goToPage}
        onClose={() => setShowContents(false)}
        isVisible={showContents}
      />

      {/* Purchase Modal */}
      {bookData.purchaseInfo && (
        <PurchaseModal
          purchaseInfo={bookData.purchaseInfo}
          bookTitle={bookData.title}
          onClose={() => setShowPurchaseModal(false)}
          isVisible={showPurchaseModal}
        />
      )}
    </div>
  );
};