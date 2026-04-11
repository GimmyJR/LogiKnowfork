'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import BookForm from '@/components/admin/BookForm';
import { ChevronLeft, BookPlus } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function NewBookPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const isAdminOrModerator = user?.roles?.includes('Admin') || user?.roles?.includes('Moderator');

  if (!isAdminOrModerator) {
    return null; // ProtectedRoute will handle redirect
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
              <BookPlus className="w-8 h-8 text-manar-cyan" />
              Add New Book
            </h1>
            <p className="text-blue-200/50 mt-2">Enter the bibliographic details for the new book entry.</p>
          </header>

          <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
            <BookForm 
              onSuccess={(book) => {
                alert('Book created successfully!');
                router.push('/admin/books');
              }}
              onCancel={() => router.push('/admin/books')}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
