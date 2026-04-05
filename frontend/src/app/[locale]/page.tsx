import {useTranslations} from 'next-intl';
import KnowledgeSpire from '@/components/KnowledgeSpire';
import LogiTokFeed from '@/components/LogiTokFeed';

export default function HomePage() {
  const t = useTranslations('Index');
  
  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden">
      {/* Left Side: MANAR Knowledge Spire */}
      <div className="w-full lg:w-1/2 h-full ltr:border-r rtl:border-l border-white/10 p-4 lg:p-6 overflow-y-auto scrollbar-hide">
        <KnowledgeSpire />
      </div>
      
      {/* Right Side: MANAR Arena */}
      <div className="hidden lg:block w-1/2 h-full bg-black/30 backdrop-blur-md border-l border-white/5">
        <LogiTokFeed />
      </div>
    </div>
  );
}
