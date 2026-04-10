'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TermsService, ExplanationResponse } from '@/api/client';
import { Loader2, Sparkles } from 'lucide-react';

export default function ExplanationPanel({ term, initialLanguage = 'ar' }: { term: any, initialLanguage?: string }) {
  const t = useTranslations('Explanation');
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [style, setStyle] = useState('Standard');

  const generateExplanation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termNameEn: term.nameEn,
          termNameAr: term.nameAr,
          category: term.category,
          definitionEn: term.definitionEn,
          lang: initialLanguage,
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate from Vercel API');
      }

      const result = await response.json();
      setExplanation({
        explanation: result.explanation,
        language: initialLanguage,
        style: style
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to generate explanation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-gold rounded-2xl p-6 md:p-8 mt-10 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,168,67,0.15)]">
      <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 p-4 opacity-10 text-manar-gold pointer-events-none">
        <Sparkles className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl md:text-2xl font-black flex items-center gap-3 text-white tracking-tight">
            <span className="p-2 bg-manar-gold/20 rounded-xl border border-manar-gold/30">
              <Sparkles className="w-5 h-5 text-manar-gold" />
            </span>
            {t('title')}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="appearance-none bg-[#0a0e1a]/80 border border-white/20 hover:border-manar-gold/50 rounded-xl pl-4 pr-10 rtl:pr-4 rtl:pl-10 py-2 text-sm font-medium text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-manar-gold transition-all cursor-pointer min-w-[140px]"
              >
                <option value="Standard">{t('standard')}</option>
                <option value="Simplified">{t('simplified')}</option>
                <option value="Academic">{t('academic')}</option>
                <option value="Storytelling">{t('storytelling')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-3 pointer-events-none text-white/50 group-hover:text-manar-gold transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            <button 
              onClick={generateExplanation}
              disabled={loading}
              className="manar-btn-gold px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(212,168,67,0.3)] hover:shadow-[0_0_25px_rgba(212,168,67,0.5)] whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="opacity-80">{t('generate')}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('generate')}
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {explanation ? (
          <div className="bg-[#050812]/60 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-inset-subtle relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-manar-gold to-manar-cyan rounded-l-2xl rtl:rounded-l-none rtl:rounded-r-2xl rtl:right-0 rtl:left-auto opacity-70"></div>
            
            <div className="space-y-4">
              {explanation.explanation.split('\n').filter(p => p.trim()).map((paragraph, index) => (
                <p 
                  key={index} 
                  className={`leading-loose text-white/90 ${initialLanguage === 'ar' ? 'font-arabic text-lg' : 'text-base'}`}
                  dir={initialLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/40 font-medium">
              <span>{style} • {initialLanguage.toUpperCase()}</span>
              <span>AI Generated</span>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16 px-4 border border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Sparkles className="w-8 h-8 text-manar-gold/50" />
              </div>
              <p className="text-white/60 font-medium max-w-sm mx-auto leading-relaxed">{t('placeholder')}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
