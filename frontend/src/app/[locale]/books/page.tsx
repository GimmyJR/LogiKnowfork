'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BooksService, BookDto, SearchService, QuoteSearchResultDto } from '@/api/client';
import BookCard from '@/components/BookCard';
import QuoteSearchBar from '@/components/QuoteSearchBar';
import QuoteResultCard from '@/components/QuoteResultCard';
import { Loader2, Library, Quote, SearchX } from 'lucide-react';

export default function BooksPage({ params }: any) {
  // Hardcoded for 'ar' or 'en' since params are async and we're a client component now
  // In a real app we'd pass locale from an async Layout or parse the path
  const locale = 'ar'; 
  const t = useTranslations('Books');
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'quotes'>('catalog');
  
  // Catalog State
  const [books, setBooks] = useState<BookDto[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // Quote Search State
  const [quotes, setQuotes] = useState<QuoteSearchResultDto[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [quotesError, setQuotesError] = useState('');
  const [quotePage, setQuotePage] = useState(1);
  const [quoteTotalPages, setQuoteTotalPages] = useState(1);
  const [currentQuoteQuery, setCurrentQuoteQuery] = useState('');
  const [currentQuoteBookId, setCurrentQuoteBookId] = useState<string | undefined>();
  const quotePageSize = 20;

  useEffect(() => {
    loadBooks(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (hasSearched && currentQuoteQuery) {
      loadQuotes(currentQuoteQuery, currentQuoteBookId, quotePage);
    }
  }, [quotePage]);

  const loadBooks = async (page: number) => {
    setBooksLoading(true);
    try {
      const res = await BooksService.getBooks(page, pageSize);
      setBooks(res.data?.data || []);
      
      // Calculate total pages from total count
      if (res.data?.meta?.total) {
        setTotalPages(Math.ceil(res.data.meta.total / pageSize));
      } else {
        setTotalPages(1);
      }
    } catch (error: any) {
      setBooksError(error.message || 'Failed to fetch books');
    } finally {
      setBooksLoading(false);
    }
  };

  const handleQuoteSearch = async (query: string, bookId?: string) => {
    setHasSearched(true);
    setCurrentQuoteQuery(query);
    setCurrentQuoteBookId(bookId);
    setQuotePage(1); // Reset to page 1 on new search
    await loadQuotes(query, bookId, 1);
  };

  const loadQuotes = async (query: string, bookId?: string, page: number = 1) => {
    setQuotesLoading(true);
    setQuotesError('');
    
    try {
      const res = await SearchService.searchQuotes(query, bookId, page, quotePageSize);
      setQuotes(res.data?.data || []);
      
      if (res.data?.meta?.total) {
        setQuoteTotalPages(Math.ceil(res.data.meta.total / quotePageSize));
      } else {
        setQuoteTotalPages(1);
      }
    } catch (error: any) {
      setQuotesError(error.response?.data?.error || error.message || 'Failed to search quotes');
    } finally {
      setQuotesLoading(false);
    }
  };

  return (
    <div className="min-h-screen manar-page-bg p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center md:text-start">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight">{t('title')}</h1>
          <p className="text-lg text-blue-200/70 max-w-2xl mx-auto md:mx-0">
            {t('description')}
          </p>
        </header>

        {/* Tabs */}
        <div className="flex justify-center md:justify-start">
          <div className="glass-panel p-1.5 flex gap-2 rounded-xl">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-manar-cyan text-manar-navy shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Library className="w-4 h-4" />
              Book Catalog
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'quotes'
                  ? 'bg-manar-gold text-manar-navy shadow-[0_0_15px_rgba(212,168,67,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Quote className="w-4 h-4" />
              Quote Search
            </button>
          </div>
        </div>

        {/* Catalog View */}
        {activeTab === 'catalog' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {booksLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-manar-cyan animate-spin" />
              </div>
            ) : booksError ? (
              <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20 text-center">
                {booksError}
              </div>
            ) : books.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} locale={locale} />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-8">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-white/60 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 glass-card rounded-3xl">
                <h3 className="text-xl font-medium text-white mb-2">{t('noBooks')}</h3>
                <p className="text-blue-200/60">{t('noBooksDesc')}</p>
              </div>
            )}
          </div>
        )}

        {/* Quote Search View */}
        {activeTab === 'quotes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <QuoteSearchBar onSearch={handleQuoteSearch} loading={quotesLoading} />
            
            <div className="pt-4">
              {quotesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-10 h-10 text-manar-gold animate-spin" />
                </div>
              ) : quotesError ? (
                <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20 text-center flex flex-col items-center gap-3">
                  <SearchX className="w-8 h-8 opacity-70" />
                  <p>{quotesError}</p>
                </div>
              ) : quotes.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-white/60 text-sm font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-manar-gold/50 rounded-full"></span>
                    Page {quotePage} of {quoteTotalPages}
                  </h3>
                  {quotes.map((quote, idx) => (
                    <QuoteResultCard key={`${quote.bookId}-${quote.pageNumber}-${idx}`} result={quote} />
                  ))}
                  
                  {quoteTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-8">
                      <button 
                        onClick={() => setQuotePage(p => Math.max(1, p - 1))}
                        disabled={quotePage === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 font-medium">
                        Page {quotePage} of {quoteTotalPages}
                      </span>
                      <button 
                        onClick={() => setQuotePage(p => Math.min(quoteTotalPages, p + 1))}
                        disabled={quotePage === quoteTotalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : hasSearched ? (
                <div className="text-center py-20 glass-card rounded-3xl border border-dashed border-white/20">
                  <SearchX className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No quotes found</h3>
                  <p className="text-blue-200/60 max-w-sm mx-auto">
                    Try adjusting your search terms or selecting a different book to search inside.
                  </p>
                </div>
              ) : (
                <div className="text-center py-24 px-4 glass-card rounded-3xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-manar-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Quote className="w-16 h-16 text-manar-gold/20 mx-auto mb-6 rotate-180 rtl:rotate-0" />
                  <h3 className="text-2xl font-bold text-white mb-3">Search Inside Books</h3>
                  <p className="text-blue-200/60 max-w-md mx-auto leading-relaxed">
                    Instantly search for specific phrases, terms, or topics across our entire library of indexed logistics literature.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
