import { getTranslations } from 'next-intl/server';
import { BooksService } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Library, User, Calendar, Languages, Bookmark, ExternalLink, Quote } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: any) {
  const { id } = await params;
  try {
    const res = await BooksService.getBook(id);
    return { title: `${res.data.data.title} - LogiKnow Library` };
  } catch {
    return { title: 'Book Not Found' };
  }
}

export default async function BookDetailPage({ params }: any) {
  const { id } = await params;

  let book;
  try {
    const res = await BooksService.getBook(id);
    book = res.data.data;
  } catch (error) {
    notFound();
  }

  const hasExternalLink = book.externalLink && book.externalLink !== "NA" && book.externalLink.length > 3;
  const hasPdf = !!(book as any).blobStoragePath;
  const pdfUrl = hasPdf ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5039/api').replace('/api', '')}${(book as any).blobStoragePath}` : null;
  const readUrl = pdfUrl || (hasExternalLink ? book.externalLink : null);

  return (
    <div className="min-h-screen manar-page-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
            
            <div className="lg:col-span-4 bg-white/5 p-12 flex flex-col items-center justify-center border-r border-white/10 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full max-w-[280px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] z-10 transition-all duration-500 group-hover:scale-[1.03]" />
              ) : (
                <div className="w-full max-w-[240px] aspect-[2/3] bg-gradient-to-br from-manar-navy to-black rounded-xl flex items-center justify-center border border-white/10 shadow-2xl z-10">
                   <Library className="w-24 h-24 text-amber-500/20" />
                </div>
              )}

              <div className="mt-12 w-full space-y-4 z-10">
                 {readUrl ? (
                    <a href={readUrl} target="_blank" rel="noopener noreferrer" 
                       className="w-full flex items-center justify-center gap-3 py-4 bg-amber-400 text-manar-navy rounded-2xl font-black shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider">
                      {hasPdf ? 'READ PDF DOCUMENT' : 'OPEN LINK'} <ExternalLink className="w-5 h-5" />
                    </a>
                 ) : (
                    <button disabled className="w-full py-4 bg-white/5 text-white/30 rounded-2xl font-bold border border-white/10 cursor-not-allowed uppercase tracking-wider">
                      No document available
                    </button>
                 )}
              </div>
            </div>

            <div className="lg:col-span-8 p-12 lg:p-16 flex flex-col justify-center relative">
               <div className="flex flex-wrap items-center gap-3 mb-6">
                 <Badge variant="secondary" className="bg-amber-400/10 text-amber-400 border-amber-400/20 px-4 py-1.5 text-sm font-black tracking-widest uppercase">{book.category}</Badge>
                 {book.isIndexedForSearch && (
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 flex items-center gap-1 bg-cyan-400/5 px-3 py-1 font-bold">
                       <Quote className="w-3.5 h-3.5" /> Full-text indexed
                    </Badge>
                 )}
               </div>

               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-10 drop-shadow-sm">{book.title}</h1>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 mb-12">
                 <div className="space-y-2">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black flex items-center gap-2">
                     <User className="w-4 h-4" /> AUTHORS
                   </p>
                   <p className="text-xl font-bold text-white leading-relaxed">{book.authors.join(', ')}</p>
                 </div>
                 
                 <div className="space-y-2">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black flex items-center gap-2">
                     <Calendar className="w-4 h-4" /> PUBLICATION YEAR
                   </p>
                   <p className="text-xl font-bold text-white">{book.year || 'N/A'}</p>
                 </div>

                 <div className="space-y-2">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black flex items-center gap-2">
                     <Languages className="w-4 h-4" /> LANGUAGE
                   </p>
                   <p className="text-xl font-bold text-white uppercase">{book.language}</p>
                 </div>

                 {book.isbn && book.isbn !== 'NA' && (
                   <div className="space-y-2">
                     <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black flex items-center gap-2">
                       <Bookmark className="w-4 h-4" /> ISBN
                     </p>
                     <p className="text-xl font-bold text-white">{book.isbn}</p>
                   </div>
                 )}
               </div>

               <div className="p-8 bg-black/20 rounded-[2rem] border border-white/5 backdrop-blur-md">
                 <p className="text-blue-100/70 leading-relaxed text-lg font-medium italic">
                    This resource is part of the LogiKnow library, providing verified logistics expertise to practitioners and researcher.
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
