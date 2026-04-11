'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BooksService, BookDto } from '@/api/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Loader2, ShieldCheck, Plus, Search, Filter, Book, Edit, Trash2, 
  Upload, Database, ExternalLink, CheckCircle2, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AdminBooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [params, setParams] = useState({ page: 1, size: 20, lang: '', category: '' });
  const [total, setTotal] = useState(0);

  const isAdminOrModerator = user?.roles?.includes('Admin') || user?.roles?.includes('Moderator');
  const isAdmin = user?.roles?.includes('Admin');

  useEffect(() => {
    if (isAdminOrModerator) loadBooks();
    else setLoading(false);
  }, [isAdminOrModerator, params]);

  const loadBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await BooksService.getAdminBooks(params.page, params.size, params.lang, params.category);
      setBooks(data.data || []);
      setTotal(data.meta.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    
    setActionLoading(id);
    try {
      await BooksService.deleteBook(id);
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to delete book');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerIndex = async (id: string) => {
    setActionLoading(id);
    try {
      await BooksService.triggerIndex(id);
      alert('Indexing triggered successfully.');
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to trigger indexing');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdminOrModerator && !loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen py-20 px-4 text-center">
          <ShieldCheck className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/60">You need Admin or Moderator privileges to view this page.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen manar-page-bg p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <nav className="flex items-center gap-2 text-blue-200/50 text-sm mb-4">
                <Link href="/admin" className="hover:text-manar-cyan transition-colors">Admin</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/70">Books Management</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-white flex items-center gap-3 tracking-tight">
                <Book className="w-8 h-8 text-manar-cyan" />
                Books Management
              </h1>
              <p className="text-blue-200/70">Manage titles, metadata, and PDF storage.</p>
            </div>
            
            <Link 
              href="/admin/books/new"
              className="bg-manar-cyan/20 hover:bg-manar-cyan/30 text-manar-cyan border border-manar-cyan/50 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-manar-cyan/10"
            >
              <Plus className="w-5 h-5" />
              Add New Book
            </Link>
          </header>

          {/* Filters & Search */}
          <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4 border border-white/10">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search titles..."
                className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:ring-1 focus:ring-manar-cyan outline-none"
              />
            </div>
            <select 
              value={params.lang}
              onChange={(e) => setParams(prev => ({ ...prev, lang: e.target.value, page: 1 }))}
              className="bg-black/40 border border-white/5 rounded-xl py-2 px-4 text-white text-sm focus:ring-1 focus:ring-manar-cyan outline-none"
            >
              <option value="">All Languages</option>
              <option value="ar">Arabic</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
            <div className="text-white/40 text-sm font-medium">
              Total: <span className="text-white">{total}</span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Books Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-manar-cyan animate-spin" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-20 px-4">
                <Book className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No books found</h3>
                <p className="text-white/40 mb-6">Start by adding your first book to the platform.</p>
                <Link 
                  href="/admin/books/new"
                  className="inline-flex items-center gap-2 text-manar-cyan border-b border-manar-cyan/30 hover:border-manar-cyan transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Book
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider uppercase">Book Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider uppercase">Details</th>
                      <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider uppercase text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-white/5 rounded border border-white/10 overflow-hidden flex-shrink-0 relative group-hover:border-manar-cyan/30 transition-colors">
                              {book.coverUrl ? (
                                <img src={book.coverUrl} title={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <Book className="w-5 h-5 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-bold mb-1 group-hover:text-manar-cyan transition-colors">{book.title}</p>
                              <p className="text-white/40 text-xs flex items-center gap-1">
                                {book.authors.join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-manar-cyan/10 text-manar-cyan border border-manar-cyan/20">
                              {book.category}
                            </span>
                            <div className="flex items-center gap-3 text-white/40 text-xs">
                              <span className="uppercase">{book.language}</span>
                              <span>{book.year}</span>
                              {book.isbn && <span className="font-mono">{book.isbn}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            {book.isPublished ? (
                              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Published
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-full text-xs font-medium border border-white/10">
                                <XCircle className="w-3 h-3" />
                                Draft
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                             <Link 
                              href={`/admin/books/${book.id}/edit`}
                              className="p-2 text-white/40 hover:text-manar-cyan hover:bg-manar-cyan/10 rounded-lg transition-all"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button 
                              onClick={() => handleTriggerIndex(book.id)}
                              disabled={actionLoading === book.id}
                              className="p-2 text-white/40 hover:text-manar-gold hover:bg-manar-gold/10 rounded-lg transition-all disabled:opacity-50"
                              title="Re-index Research"
                            >
                              {actionLoading === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                            </button>

                            {isAdmin && (
                              <button 
                                onClick={() => handleDelete(book.id, book.title)}
                                disabled={actionLoading === book.id}
                                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                title="Delete Book"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Placeholder */}
            {total > params.size && (
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
                <button 
                  onClick={() => setParams(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={params.page === 1}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <span className="text-white/40 text-sm">
                  Page <span className="text-white font-bold">{params.page}</span> of {Math.ceil(total / params.size)}
                </span>
                <button 
                  onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
                  disabled={params.page * params.size >= total}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
