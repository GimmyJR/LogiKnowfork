'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BooksService, BookDto } from '@/api/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import BookForm from '@/components/admin/BookForm';
import { ChevronLeft, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function EditBookPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [book, setBook] = useState<BookDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdminOrModerator = user?.roles?.includes('Admin') || user?.roles?.includes('Moderator');

  useEffect(() => {
    if (isAdminOrModerator && id) {
      loadBook();
    } else {
      setLoading(false);
    }
  }, [isAdminOrModerator, id]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const { data } = await BooksService.getBook(id as string);
      setBook(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load book details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminOrModerator && !loading) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen manar-page-bg p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <Link 
              href="/admin/books"
              className="inline-flex items-center gap-2 text-white/60 hover:text-manar-cyan transition-colors mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Books
            </Link>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Edit3 className="w-8 h-8 text-manar-cyan" />
              Edit Book: <span className="text-manar-cyan/70">{book?.title || 'Loading...'}</span>
            </h1>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-manar-cyan animate-spin" />
            </div>
          ) : error ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Book</h3>
              <p className="text-white/60 mb-8">{error}</p>
              <Link href="/admin/books" className="text-manar-cyan hover:underline">Return to list</Link>
            </div>
          ) : book ? (
            <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
              <BookForm 
                initialData={book}
                onSuccess={(updatedBook) => {
                  alert('Book updated successfully!');
                  router.push('/admin/books');
                }}
                onCancel={() => router.push('/admin/books')}
              />
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
