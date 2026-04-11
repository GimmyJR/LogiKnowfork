'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, BookDto } from '@/api/client';
import { Search, Loader2, BookOpen, Quote, SearchX, ChevronLeft, ChevronRight, Sparkles, Filter } from 'lucide-react';

interface QuoteResult {
  bookId: string;
  bookTitle: string;
  bookAuthors: string;
  bookCategory: string;
  bookCoverUrl?: string;
  pageNumber: number;
  snippet: string;
  highlight: string;
}

interface BookFilterItem {
  id: string;
  title: string;
  category: string;
  language: string;
  hasPages: boolean;
}

export default function QuoteSearchPage() {
  // Search state
  const [query, setQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [results, setResults] = useState<QuoteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 15;

  // Books for filter dropdown
  const [filterBooks, setFilterBooks] = useState<BookFilterItem[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // Saved search for pagination
  const [savedQuery, setSavedQuery] = useState('');
  const [savedBookId, setSavedBookId] = useState<string>('all');

  // Load books for the filter dropdown
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await apiClient.get('/quotesearch/books');
        setFilterBooks(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load books for filter:', err);
      } finally {
        setBooksLoading(false);
      }
    };
    loadBooks();
  }, []);

  const doSearch = useCallback(async (searchQuery: string, bookId: string, pg: number) => {
    setLoading(true);
    setError('');

    try {
      const params: Record<string, any> = { q: searchQuery, page: pg, size: pageSize };
      if (bookId && bookId !== 'all') {
        params.bookId = bookId;
      }

      const res = await apiClient.get('/quotesearch', { params });
      const data = res.data;

      setResults(data?.data || []);
      setTotalResults(data?.meta?.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data?.meta?.total || 0) / pageSize)));
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    setPage(1);
    setSavedQuery(query.trim());
    setSavedBookId(selectedBookId);
    await doSearch(query.trim(), selectedBookId, 1);
  };

  // Handle pagination
  useEffect(() => {
    if (hasSearched && savedQuery && page > 0) {
      doSearch(savedQuery, savedBookId, page);
    }
  }, [page]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen manar-page-bg py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-300 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            Deep Library Search
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Search Inside <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Books</span>
          </h1>
          <p className="text-blue-200/60 text-lg max-w-xl mx-auto leading-relaxed">
            Find specific quotes, terms, or passages across our entire indexed library of logistics literature.
          </p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="glass-panel-heavy p-6 md:p-8 space-y-4" id="quote-search-form">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-amber-400 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="quote-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a quote, term, or phrase to search..."
                className="w-full bg-[#0d1220]/90 border border-white/15 hover:border-amber-400/40 focus:border-amber-400/60 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/25 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all text-[15px] shadow-lg"
              />
            </div>

            {/* Book Filter */}
            <div className="relative group min-w-[220px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-amber-400 transition-colors">
                {booksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              </div>
              <select
                id="quote-search-book-filter"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                disabled={booksLoading}
                className="w-full appearance-none bg-[#0d1220]/90 border border-white/15 hover:border-amber-400/40 focus:border-amber-400/60 rounded-xl pl-10 pr-10 py-4 text-sm text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all cursor-pointer shadow-lg disabled:opacity-40"
              >
                <option value="all">All Books</option>
                {filterBooks.filter(b => b.hasPages).map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title.length > 40 ? book.title.substring(0, 40) + '…' : book.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-white/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Search Button */}
            <button
              id="quote-search-submit"
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 50%, #d4a843 100%)',
                color: '#0a0e1a',
                boxShadow: '0 0 20px rgba(212, 168, 67, 0.25), 0 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {/* Active filter indicator */}
          {selectedBookId !== 'all' && (
            <div className="flex items-center gap-2 text-xs text-amber-300/70 pl-1">
              <BookOpen className="w-3.5 h-3.5" />
              Filtering by: <span className="font-semibold text-amber-300">{filterBooks.find(b => b.id === selectedBookId)?.title || 'Selected book'}</span>
              <button
                type="button"
                onClick={() => setSelectedBookId('all')}
                className="ml-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </form>

        {/* Results Area */}
        <div className="space-y-5 min-h-[300px]">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-400/10 animate-ping" />
              </div>
              <p className="text-white/40 text-sm font-medium animate-pulse">Searching through pages…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="glass-card p-8 rounded-2xl border border-red-500/20 text-center space-y-3">
              <SearchX className="w-10 h-10 text-red-400/70 mx-auto" />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Results Header */}
          {!loading && !error && hasSearched && results.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-white/50 text-sm font-medium">
                Found <span className="text-amber-400 font-bold">{totalResults}</span> result{totalResults !== 1 ? 's' : ''}
                {savedBookId !== 'all' && <span> in selected book</span>}
              </p>
              <p className="text-white/30 text-xs">
                Page {page} of {totalPages}
              </p>
            </div>
          )}

          {/* Result Cards */}
          {!loading && !error && results.map((result, idx) => (
            <div
              key={`${result.bookId}-${result.pageNumber}-${idx}`}
              className="glass-card p-6 md:p-8 rounded-2xl border border-white/8 hover:border-amber-400/25 transition-all duration-500 group relative overflow-hidden"
              style={{
                animationDelay: `${idx * 60}ms`,
                animation: 'fadeSlideUp 0.5s ease-out forwards',
                opacity: 0,
              }}
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/[0.02] group-hover:to-transparent transition-all duration-700 pointer-events-none" />

              <div className="relative space-y-4">
                {/* Quote content */}
                <div className="relative pl-5 border-l-2 border-amber-400/40">
                  <Quote className="absolute -left-3 -top-1 w-6 h-6 text-amber-400/20 rotate-180" />
                  <p
                    className="text-white/85 text-[15px] leading-[1.85] font-light"
                    dangerouslySetInnerHTML={{ __html: result.highlight }}
                  />
                </div>

                {/* Book metadata footer */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/8">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400/80" />
                    <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {result.bookTitle}
                    </span>
                  </div>

                  <div className="w-1 h-1 rounded-full bg-white/20" />

                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/50">
                    Page {result.pageNumber}
                  </span>

                  {result.bookCategory && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-xs text-white/30">{result.bookCategory}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* No Results */}
          {!loading && !error && hasSearched && results.length === 0 && (
            <div className="text-center py-24 glass-card rounded-3xl border border-dashed border-white/15 space-y-5">
              <SearchX className="w-14 h-14 text-white/15 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white/80">No quotes found</h3>
                <p className="text-blue-200/50 max-w-sm mx-auto leading-relaxed text-sm">
                  Try different search terms, or select a specific book with indexed pages.
                </p>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!loading && !hasSearched && (
            <div className="text-center py-28 px-6 glass-card rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-400/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative space-y-6">
                <div className="relative inline-block">
                  <Quote className="w-20 h-20 text-amber-400/15 mx-auto rotate-180" />
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-amber-400/5 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white/90">Search Inside Books</h3>
                  <p className="text-blue-200/50 max-w-md mx-auto leading-relaxed">
                    Search for specific phrases, terminology, or topics across our entire indexed library of logistics and supply chain literature.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {['supply chain', 'logistics management', 'freight forwarding', 'warehouse'].map(term => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-medium hover:bg-amber-400/10 hover:border-amber-400/30 hover:text-amber-300 transition-all duration-300 cursor-pointer"
                    >
                      &ldquo;{term}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && results.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-6 pb-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium disabled:opacity-30 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        pageNum === page
                          ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(212,168,67,0.2)]'
                          : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium disabled:opacity-30 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        #quote-search-form mark {
          background: linear-gradient(135deg, rgba(212, 168, 67, 0.35), rgba(212, 168, 67, 0.2));
          color: #fbbf24;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
