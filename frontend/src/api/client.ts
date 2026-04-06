import axios from 'axios';

// Get the base URL from env variables, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5039/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send httpOnly cookies with every request
});

// Types based on our backend DTOs
export interface TermDto {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr?: string;
  category: string;
  definitionEn: string;
  definitionAr: string;
  exampleEn?: string;
  exampleAr?: string;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookDto {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  isbn?: string;
  language: string;
  category: string;
  coverUrl?: string;
  externalLink?: string;
  isIndexedForSearch: boolean;
  isPublished: boolean;
}

export interface AcademicEntryDto {
  id: string;
  title: string;
  author: string;
  university: string;
  year: number;
  supervisor?: string;
  abstract: string;
  documentUrl?: string;
  type: string;
  status: string;
  tags: string[];
}

export interface SubmissionDto {
  id: string;
  entityType: string;
  jsonData: string;
  status: string;
  reviewNotes?: string;
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ExplanationResponse {
  explanation: string;
  language: string;
  style: string;
}

export interface SearchResultDto {
  type: string;
  id: string;
  title: string;
  snippet?: string;
  score: number;
  metadata: Record<string, any>;
}

export interface QuoteSearchResultDto {
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  highlight: string;
  surroundingContext: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
  };
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName?: string;
  preferredLanguage: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName?: string;
  roles: string[];
}

export interface SingleResponse<T> {
  data: T;
}

// API Services
export const TermsService = {
  getTerms: (page = 1, size = 20) => 
    apiClient.get<PaginatedResponse<TermDto>>('/terms', { params: { page, size } }),
    
  getTerm: (id: string) => 
    apiClient.get<TermDto>(`/terms/${id}`),

  explainTerm: (id: string, language?: string, style?: string) => 
    apiClient.get<ExplanationResponse>(`/terms/${id}/explain`, { params: { language, style } })
};

export const BooksService = {
  getBooks: (page = 1, size = 20) => 
    apiClient.get<PaginatedResponse<BookDto>>('/books', { params: { page, size } }),
    
  getBook: (id: string) =>
    apiClient.get<SingleResponse<BookDto>>(`/books/${id}`),
    
  submitBook: (data: any) =>
    apiClient.post<SingleResponse<BookDto>>('/books/submit', data),

  uploadBook: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/books/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const AcademicService = {
  getEntries: (page = 1, size = 20) =>
    apiClient.get<PaginatedResponse<AcademicEntryDto>>('/academic', { params: { page, size } }),
    
  getEntry: (id: string) =>
    apiClient.get<SingleResponse<AcademicEntryDto>>(`/academic/${id}`),
  submitEntry: (data: any) =>
    apiClient.post<SingleResponse<AcademicEntryDto>>('/academic/submit', data),
};

export const ModerationService = {
  getPending: (page = 1, size = 20) =>
    apiClient.get<PaginatedResponse<SubmissionDto>>('/moderation/pending', { params: { page, size } }),
  approve: (id: string) =>
    apiClient.post<{ message: string; data: SubmissionDto }>(`/moderation/${id}/approve`, {}),
  reject: (id: string, reason: string) =>
    apiClient.post<{ message: string; data: SubmissionDto }>(`/moderation/${id}/reject`, { reason }),
};

export const SearchService = {
  search: (query: string, type?: string, page = 1, size = 20) => 
    apiClient.get<PaginatedResponse<SearchResultDto>>('/search', { params: { q: query, type, page, size } }),
    
  searchQuotes: (query: string, bookId?: string, page = 1, size = 20) =>
    apiClient.get<PaginatedResponse<QuoteSearchResultDto>>('/search/quotes', { params: { q: query, bookId, page, size }})
};

export const AuthService = {
  register: (data: { email: string; password: string; fullName?: string; preferredLanguage?: string }) =>
    apiClient.post<SingleResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<SingleResponse<AuthResponse>>('/auth/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: () =>
    apiClient.post<SingleResponse<AuthResponse>>('/auth/refresh'),

  me: () =>
    apiClient.get<AuthUser>('/auth/me'),
};
