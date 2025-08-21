export interface BookPage {
  id: number;
  content: string;
  chapter?: string;
  isChapterStart?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  pageNumber: number;
  level: number; // 2 for H2, 3 for H3, etc.
  parentId?: string; // For hierarchical structure
}

export interface PurchaseInfo {
  link: string;
  text: string;
  price?: string;
}

export interface BookData {
  title: string;
  subtitle?: string; // Optional subtitle
  author: string;
  coverImage?: string; // Optional cover image URL
  purchaseInfo?: PurchaseInfo; // Purchase information
  pages: BookPage[];
  chapters: Chapter[];
  totalPages: number;
}