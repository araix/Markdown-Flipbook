import { BookData, BookPage, Chapter, PurchaseInfo } from '../types/book';

export class MarkdownParser {
  private static readonly WORDS_PER_PAGE = 280; // Reduced to ensure content fits
  private static readonly LINES_PER_PAGE = 25;

  static parseMarkdown(markdown: string): BookData {
    // Extract title, subtitle, and author from frontmatter
    const { title, subtitle, author } = this.extractMetadata(markdown);
    
    // Extract featured image (look for frontmatter or first image)
    const coverImage = this.extractCoverImage(markdown);
    
    // Extract purchase information
    const purchaseInfo = this.extractPurchaseInfo(markdown);

    // Clean markdown - remove frontmatter, cover image references, and TOC section
    const cleanedMarkdown = this.cleanMarkdown(markdown);

    // Split content into pages first
    const pages = this.createPages(cleanedMarkdown, title, subtitle, author, !!coverImage);
    
    // Extract chapters with correct page numbers based on actual pages
    const chapters = this.extractChaptersFromPages(pages, cleanedMarkdown);
    
    return {
      title,
      subtitle,
      author,
      coverImage,
      purchaseInfo,
      pages,
      chapters,
      totalPages: pages.length
    };
  }

  private static extractMetadata(markdown: string): { title: string; subtitle?: string; author: string } {
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    let title = 'Untitled Book';
    let subtitle: string | undefined;
    let author = 'Unknown Author';

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      
      // Extract title from frontmatter
      const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/['"]/g, '');
      }

      // Extract subtitle from frontmatter
      const subtitleMatch = frontmatter.match(/^subtitle:\s*(.+)$/m);
      if (subtitleMatch) {
        subtitle = subtitleMatch[1].trim().replace(/['"]/g, '');
      }

      // Extract author from frontmatter
      const authorMatch = frontmatter.match(/^author:\s*(.+)$/m);
      if (authorMatch) {
        author = authorMatch[1].trim().replace(/['"]/g, '');
      }
    }

    // Fallback to extracting from content if not found in frontmatter
    if (title === 'Untitled Book') {
      const lines = markdown.split('\n');
      const titleMatch = lines.find(line => line.startsWith('# '));
      if (titleMatch) {
        title = titleMatch.replace('# ', '');
      }
    }

    if (!subtitle && title === 'Untitled Book') {
      const lines = markdown.split('\n');
      const subtitleMatch = lines.find(line => line.startsWith('*') && line.endsWith('*'));
      if (subtitleMatch) {
        subtitle = subtitleMatch.replace(/\*/g, '');
      }
    }

    return { title, subtitle, author };
  }

  private static extractCoverImage(markdown: string): string | undefined {
    // Check for frontmatter with cover image
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const coverMatch = frontmatter.match(/^cover_image:\s*(.+)$/m);
      if (coverMatch) {
        return coverMatch[1].trim().replace(/['"]/g, '');
      }
    }

    // Look for the first image in the content
    const imageMatches = markdown.match(/!\[.*?\]\((.*?)\)/);
    if (imageMatches && imageMatches[1]) {
      return imageMatches[1];
    }

    // Look for HTML img tags
    const htmlImageMatch = markdown.match(/<img[^>]+src=['"](.*?)['"][^>]*>/);
    if (htmlImageMatch && htmlImageMatch[1]) {
      return htmlImageMatch[1];
    }

    return undefined;
  }

  private static extractPurchaseInfo(markdown: string): PurchaseInfo | undefined {
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const linkMatch = frontmatter.match(/^purchase_link:\s*(.+)$/m);
      const textMatch = frontmatter.match(/^purchase_text:\s*(.+)$/m);
      const priceMatch = frontmatter.match(/^price:\s*(.+)$/m);

      if (linkMatch && textMatch) {
        return {
          link: linkMatch[1].trim().replace(/['"]/g, ''),
          text: textMatch[1].trim().replace(/['"]/g, ''),
          price: priceMatch ? priceMatch[1].trim().replace(/['"]/g, '') : undefined
        };
      }
    }
    return undefined;
  }

  private static cleanMarkdown(markdown: string): string {
    // Remove frontmatter
    let cleaned = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    // Remove the first image if it exists (likely the cover image)
    cleaned = cleaned.replace(/!\[.*?\]\([^)]+\)\n?/, '');
    cleaned = cleaned.replace(/<img[^>]*>\n?/, '');
    
    // Remove the Table of Contents section completely
    cleaned = cleaned.replace(/## Table of Contents[\s\S]*?(?=---|\n## [^T])/g, '');
    
    // Remove any standalone title and subtitle at the beginning
    cleaned = cleaned.replace(/^# .*\n/m, '');
    cleaned = cleaned.replace(/^\*.*\*\n/m, '');
    
    return cleaned;
  }

  private static extractChaptersFromPages(pages: BookPage[], originalMarkdown: string): Chapter[] {
    const chapters: Chapter[] = [];
    const lines = originalMarkdown.split('\n');
    let parentStack: string[] = []; // Stack to track parent hierarchy

    // Create a map of heading text to page numbers
    const headingToPageMap = new Map<string, number>();

    // Go through each page and find headings
    for (const page of pages) {
      const pageContent = page.content;
      
      // Extract headings from the HTML content
      const headingMatches = pageContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g);
      if (headingMatches) {
        for (const match of headingMatches) {
          const textMatch = match.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/);
          if (textMatch && textMatch[1]) {
            const headingText = textMatch[1].trim();
            // Use the first occurrence (in case of duplicates)
            if (!headingToPageMap.has(headingText)) {
              headingToPageMap.set(headingText, page.id);
            }
          }
        }
      }
    }

    // Now extract chapter information from original markdown
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for all heading levels (##, ###, ####, etc.)
      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch && !line.includes('Table of Contents')) {
        const level = headingMatch[1].length; // 2 for ##, 3 for ###, etc.
        const fullTitle = headingMatch[2];
        
        // Extract ID from {#id} syntax or generate from title
        const idMatch = fullTitle.match(/\{#([^}]+)\}/);
        const id = idMatch ? idMatch[1] : fullTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const title = fullTitle.replace(/\s*\{#[^}]+\}/, ''); // Remove ID from title
        
        // Find the page number from our map
        let pageNumber = headingToPageMap.get(title) || 1;
        
        // If not found in map, try to find partial matches
        if (pageNumber === 1 && !headingToPageMap.has(title)) {
          for (const [mapTitle, mapPage] of headingToPageMap) {
            if (mapTitle.includes(title) || title.includes(mapTitle)) {
              pageNumber = mapPage;
              break;
            }
          }
        }
        
        // Manage parent hierarchy
        // Remove parents that are at same or deeper level
        while (parentStack.length > 0) {
          const lastParent = chapters.find(c => c.id === parentStack[parentStack.length - 1]);
          if (lastParent && level <= lastParent.level) {
            parentStack.pop();
          } else {
            break;
          }
        }
        
        // Find parent (the most recent heading at a higher level)
        const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1] : undefined;
        
        const chapter: Chapter = {
          id,
          title,
          pageNumber,
          level,
          parentId
        };
        
        chapters.push(chapter);
        
        // Add this chapter to parent stack for future children
        parentStack.push(id);
      }
    }

    return chapters;
  }

  private static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private static createPages(markdown: string, title: string, subtitle: string | undefined, author: string, hasCoverImage: boolean): BookPage[] {
    const pages: BookPage[] = [];
    let pageId = 1;

    // Create title page if there's a cover image
    if (hasCoverImage) {
      const titlePageContent = this.createTitlePage(title, subtitle, author);
      pages.push({
        id: pageId++,
        content: titlePageContent,
        chapter: 'Title Page',
        isChapterStart: true
      });
    }

    // Process the rest of the content
    const sections = this.splitIntoSections(markdown);
    let currentChapter = '';

    for (const section of sections) {
      if (section.isChapterStart) {
        currentChapter = section.title || '';
      }

      const sectionPages = this.paginateSection(section.content, section.isChapterStart);
      
      for (const pageContent of sectionPages) {
        pages.push({
          id: pageId++,
          content: this.formatContent(pageContent),
          chapter: currentChapter,
          isChapterStart: section.isChapterStart && pages.filter(p => p.chapter === currentChapter).length === 0
        });
      }
    }

    return pages;
  }

  private static createTitlePage(title: string, subtitle: string | undefined, author: string): string {
    return `
      <div class="h-full flex flex-col justify-center items-center text-center space-y-8">
        <div class="space-y-6">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-amber-900 leading-tight font-serif">
            ${title}
          </h1>
          ${subtitle ? `
            <p class="text-base sm:text-lg md:text-xl lg:text-2xl font-light italic text-amber-700 leading-relaxed">
              ${subtitle}
            </p>
          ` : ''}
          <div class="w-32 h-px bg-amber-600 mx-auto"></div>
          <p class="text-lg sm:text-xl md:text-2xl font-light text-amber-800">
            ${author}
          </p>
        </div>
      </div>
    `;
  }

  private static splitIntoSections(markdown: string) {
    const sections = [];
    const lines = markdown.split('\n');
    let currentSection = { content: '', isChapterStart: false, title: '' };

    for (const line of lines) {
      // Check for any heading level as chapter start
      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch && !line.includes('Table of Contents')) {
        // Save previous section
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        
        // Start new chapter section
        const cleanTitle = headingMatch[2].replace(/\s*\{#[^}]+\}/, '');
        currentSection = {
          content: line + '\n',
          isChapterStart: true,
          title: cleanTitle
        };
      } else if (line === '---') {
        // Page break marker
        if (currentSection.content.trim()) {
          sections.push(currentSection);
          currentSection = { content: '', isChapterStart: false, title: '' };
        }
      } else {
        currentSection.content += line + '\n';
      }
    }

    // Add final section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  private static paginateSection(content: string, isChapterStart: boolean): string[] {
    const pages: string[] = [];
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    let currentPage = '';
    let currentWordCount = 0;
    // Reduced word count to ensure content fits in page boundaries
    const maxWords = isChapterStart ? this.WORDS_PER_PAGE * 0.6 : this.WORDS_PER_PAGE;

    for (const paragraph of paragraphs) {
      const paraWordCount = paragraph.split(/\s+/).filter(word => word.length > 0).length;
      
      if (currentWordCount + paraWordCount > maxWords && currentPage.trim()) {
        pages.push(currentPage.trim());
        currentPage = paragraph + '\n\n';
        currentWordCount = paraWordCount;
      } else {
        currentPage += paragraph + '\n\n';
        currentWordCount += paraWordCount;
      }
    }

    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }

    return pages.length > 0 ? pages : [''];
  }

  private static formatContent(content: string): string {
    return content
      // Convert markdown headers with responsive styling and remove ID syntax
      .replace(/^(#{6})\s+(.*?)\s*\{#[^}]+\}/gim, '<h6 class="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-amber-700 break-words">$2</h6>')
      .replace(/^(#{6})\s+(.*$)/gim, '<h6 class="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-amber-700 break-words">$2</h6>')
      .replace(/^(#{5})\s+(.*?)\s*\{#[^}]+\}/gim, '<h5 class="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-amber-700 break-words">$2</h5>')
      .replace(/^(#{5})\s+(.*$)/gim, '<h5 class="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-amber-700 break-words">$2</h5>')
      .replace(/^(#{4})\s+(.*?)\s*\{#[^}]+\}/gim, '<h4 class="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-amber-800 break-words">$2</h4>')
      .replace(/^(#{4})\s+(.*$)/gim, '<h4 class="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-amber-800 break-words">$2</h4>')
      .replace(/^(#{3})\s+(.*?)\s*\{#[^}]+\}/gim, '<h3 class="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 text-amber-800 break-words">$2</h3>')
      .replace(/^(#{3})\s+(.*$)/gim, '<h3 class="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 text-amber-800 break-words">$2</h3>')
      .replace(/^(#{2})\s+(.*?)\s*\{#[^}]+\}/gim, '<h2 class="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-amber-900 break-words">$2</h2>')
      .replace(/^(#{2})\s+(.*$)/gim, '<h2 class="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-amber-900 break-words">$2</h2>')
      .replace(/^(#{1})\s+(.*?)\s*\{#[^}]+\}/gim, '<h1 class="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-amber-900 break-words">$2</h1>')
      .replace(/^(#{1})\s+(.*$)/gim, '<h1 class="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-amber-900 break-words">$2</h1>')
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Convert paragraphs with responsive styling and better spacing
      .replace(/\n\n/g, '</p><p class="mb-2 sm:mb-3 md:mb-4 leading-relaxed break-words">')
      // Wrap in paragraph tags
      .replace(/^(.+)/, '<p class="mb-2 sm:mb-3 md:mb-4 leading-relaxed break-words">$1')
      .replace(/(.+)$/, '$1</p>')
      // Clean up empty paragraphs
      .replace(/<p class="mb-2 sm:mb-3 md:mb-4 leading-relaxed break-words"><\/p>/g, '');
  }
}