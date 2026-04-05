'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2 } from 'lucide-react';
import { SearchService, SearchResultDto } from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Link } from '@/i18n/routing';

export default function SearchBar() {
  const t = useTranslations('Index');
  const tSearch = useTranslations('Search');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await SearchService.search(debouncedQuery);
        setResults(res.data?.data || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-blue-300/50 rtl:right-4 rtl:left-auto" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={t('searchPlaceholder')}
          className="w-full py-4 pl-12 pr-4 text-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 rtl:pr-12 rtl:pl-4 transition-all backdrop-blur-md text-white placeholder:text-blue-200/40"
        />
        {loading && (
          <Loader2 className="absolute right-4 w-5 h-5 animate-spin text-amber-400 rtl:left-4 rtl:right-auto" />
        )}
      </div>

      {open && query && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-xl shadow-2xl overflow-hidden z-50">
          {results.length === 0 && !loading && (
            <div className="p-4 text-blue-200/50 text-center">{tSearch('noResults')}</div>
          )}
          <ul className="max-h-[400px] overflow-y-auto">
            {results.map((r) => {
              const basePath = r.type === 'academic' ? 'academic' : `${r.type}s`;
              return (
                <li key={`${r.type}-${r.id}`} className="border-b last:border-0 border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                  <Link href={`/${basePath}/${r.id}` as any} onClick={() => setOpen(false)} className="block p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-400">{r.title}</span>
                      <span className="text-xs uppercase tracking-wider text-blue-200/50 font-medium px-2 py-1 bg-white/10 rounded-full">{r.type}</span>
                    </div>
                    {r.snippet && (
                      <p className="text-sm text-blue-100/60 line-clamp-2" dangerouslySetInnerHTML={{ __html: r.snippet }}></p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
