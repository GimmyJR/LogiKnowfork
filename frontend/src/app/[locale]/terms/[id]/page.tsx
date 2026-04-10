import { getTranslations } from 'next-intl/server';
import { TermsService } from '@/api/client';
import ExplanationPanel from '@/components/ExplanationPanel';
import { Badge } from '@/components/ui/Badge';
import { BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: any) {
  const { locale, id } = await params;
  try {
    const res = await TermsService.getTerm(id);
    const term = res.data.data;
    const title = locale === 'ar' ? term.nameAr : (locale === 'fr' ? (term.nameFr || term.nameEn) : term.nameEn);
    return { title: `${title} - MANAR` };
  } catch {
    return { title: 'Term Not Found' };
  }
}

export default async function TermPage({ params }: any) {
  const { locale, id } = await params;
  const t = await getTranslations('TermDetail');

  let term;
  try {
    const res = await TermsService.getTerm(id);
    term = res.data.data;
  } catch (error) {
    notFound();
  }

  const title = locale === 'ar' ? term.nameAr : (locale === 'fr' ? (term.nameFr || term.nameEn) : term.nameEn);
  const definition = locale === 'ar' ? term.definitionAr : term.definitionEn;
  const example = locale === 'ar' ? term.exampleAr : term.exampleEn;

  return (
    <div className="min-h-screen manar-page-bg p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{term.category}</Badge>
                <div className="flex gap-1">
                  {term.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">{title}</h1>
              
              <div className="prose prose-invert prose-lg max-w-none text-blue-100/80">
                <p>{definition}</p>
                
                {example && (
                  <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">{t('exampleInContext')}</h4>
                    <p className="italic text-blue-100/70">&ldquo;{example}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-amber-500/20 text-amber-400 rounded-2xl shrink-0 hidden md:block">
              <BookOpen className="w-12 h-12" />
            </div>
          </div>
        </div>

        <ExplanationPanel term={term} initialLanguage={locale} />
      </div>
    </div>
  );
}
