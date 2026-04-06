import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2, Book, Anchor } from 'lucide-react';
import { BooksService, BookDto } from '@/api/client';

export default function QuoteSearchBar({ 
  onSearch, 
  loading 
}: { 
  onSearch: (query: string, bookId?: string) => void,
  loading: boolean 
}) {
  const t = useTranslations('Search');
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('all');
  const [books, setBooks] = useState<BookDto[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let allBooks: BookDto[] = [];
        let page = 1;
        let totalPages = 1;
        
        do {
          const res = await BooksService.getBooks(page, 100);
          allBooks = [...allBooks, ...res.data.data];
          
          if (res.data.meta && res.data.meta.total) {
            totalPages = Math.ceil(res.data.meta.total / 100);
          } else {
            totalPages = 1;
          }
          page++;
        } while (page <= totalPages);
        
        // Fetch published books (MockSearchService searches all books even if not indexed via ES)
        setBooks(allBooks.filter(b => b.isPublished));
      } catch (error) {
        console.error('Failed to load books for filter', error);
      } finally {
        setBooksLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), selectedBook === 'all' ? undefined : selectedBook);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative z-20">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow group">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pl-0 rtl:pr-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-manar-gold transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0a0e1a]/80 border border-white/20 hover:border-manar-gold/50 rounded-xl pl-12 rtl:pl-4 pr-4 rtl:pr-12 py-3.5 text-white placeholder-white/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-manar-gold transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            placeholder="Search for quotes, terms, or phrases inside books..."
          />
        </div>
        
        <div className="relative group min-w-[200px]">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-manar-gold transition-colors">
            {booksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Book className="w-4 h-4" />}
          </div>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            disabled={booksLoading || books.length === 0}
            className="w-full appearance-none bg-[#0a0e1a]/80 border border-white/20 hover:border-manar-gold/50 rounded-xl pl-10 rtl:pl-8 pr-10 rtl:pr-10 py-3.5 text-sm text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-manar-gold transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)] disabled:opacity-50"
          >
            <option value="all">All Books</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title.length > 30 ? book.title.substring(0, 30) + '...' : book.title}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pr-0 rtl:pl-3 pointer-events-none text-white/50 group-hover:text-manar-gold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="manar-btn-gold px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(212,168,67,0.3)] hover:shadow-[0_0_25px_rgba(212,168,67,0.5)]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Anchor className="w-4 h-4" />
          )}
          Search
        </button>
      </div>
    </form>
  );
}
