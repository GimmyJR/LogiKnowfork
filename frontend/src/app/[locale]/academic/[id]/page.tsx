import { getTranslations } from 'next-intl/server';
import { AcademicService } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, FileText, Calendar, School, User, Link2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: any) {
  const { id } = await params;
  try {
    const res = await AcademicService.getEntry(id);
    return { title: `${res.data.data.title} - LogiKnow` };
  } catch {
    return { title: 'Academic Entry Not Found' };
  }
}

export default async function AcademicEntryPage({ params }: any) {
  const { id } = await params;
  // const t = await getTranslations('Academic'); // We might not need translations for everything since it's DTO based

  let entry;
  try {
    const res = await AcademicService.getEntry(id);
    entry = res.data.data;
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen manar-page-bg p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <GraduationCap className="w-64 h-64 text-white" />
          </div>

          <div className="flex flex-col gap-8 relative z-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/5 text-amber-400 rounded-2xl border border-white/10 shadow-inner">
                  {entry.type.toLowerCase().includes('thesis') ? <GraduationCap className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
                </div>
                <div>
                   <Badge variant="secondary" className="mb-2 bg-amber-400/10 text-amber-400 border-amber-400/20 px-3 py-1 text-sm font-bold tracking-wide">{entry.type}</Badge>
                   <div className="flex items-center gap-2 text-blue-200/50 text-sm font-medium">
                     <Calendar className="w-4 h-4" />
                     {entry.year}
                   </div>
                </div>
              </div>
              
              {entry.documentUrl && (
                <a href={entry.documentUrl} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-manar-navy rounded-2xl font-black shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-300">
                  <Link2 className="w-5 h-5" />
                  VIEW DOCUMENT
                </a>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">{entry.title}</h1>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Author
                </p>
                <p className="text-xl font-bold text-white">{entry.author}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black flex items-center gap-2">
                  <School className="w-3.5 h-3.5" /> University
                </p>
                <p className="text-xl font-bold text-white">{entry.university}</p>
              </div>
              {entry.supervisor && (
                <div className="space-y-1.5 md:col-span-2 pt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/40 font-black">Supervisor</p>
                  <p className="text-xl font-bold text-blue-100">{entry.supervisor}</p>
                </div>
              )}
            </div>

            {/* Abstract */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-amber-400 rounded-full"></div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  Abstract
                </h3>
              </div>
              <div className="prose prose-invert prose-lg max-w-none text-blue-100/70 leading-relaxed font-medium">
                <p className="whitespace-pre-wrap">{entry.abstract}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2.5 pt-8 border-t border-white/10">
              {entry.tags?.map((tag: string) => (
                <span key={tag} className="bg-white/5 border border-white/10 text-blue-200/60 py-1.5 px-4 rounded-full text-xs font-bold tracking-wide hover:bg-white/10 transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
