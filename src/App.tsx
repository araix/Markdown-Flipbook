import React, { useState, useEffect } from 'react';
import { BookReader } from './components/BookReader';
import { MarkdownParser } from './utils/markdownParser';
import { BookData } from './types/book';
import manuscriptContent from './data/manuscript.md?raw';

function App() {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parseBook = async () => {
      try {
        const parsedBook = MarkdownParser.parseMarkdown(manuscriptContent);
        setBookData(parsedBook);
      } catch (error) {
        console.error('Error parsing manuscript:', error);
      } finally {
        setLoading(false);
      }
    };

    parseBook();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-medium">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading book content</p>
        </div>
      </div>
    );
  }

  return <BookReader bookData={bookData} />;
}

export default App;