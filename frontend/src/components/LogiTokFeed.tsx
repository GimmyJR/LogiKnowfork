'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Video, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';

export default function LogiTokFeed() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        // Fetch real videos from our new ArenaVideos endpoint
        const response = await apiClient.get('/arenavideos', { params: { size: 10 } });
        setVideos(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch arena videos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Universal video embedding helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('instagram.com')) {
      if (url.includes('/embed')) return url;
      const base = url.split('?')[0].replace(/\/$/, "");
      return `${base}/embed`;
    }
    if (url.includes('tiktok.com')) {
      const videoIdMatch = url.match(/\/video\/(\d+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
      }
    }
    return url; // Assume it's an embed URL or other format
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Sticky Header */}
      <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 z-20 bg-black/40 backdrop-blur-md border-b border-white/5">
        <h2 className="text-2xl font-black text-white glow-text italic">MANAR Arena</h2>
        <span className="px-4 py-1 rounded-full glass-panel text-xs text-manar-cyan font-bold tracking-widest border-manar-cyan/50">LIVE PITCHES</span>
      </div>

      {/* Scrollable Video List — scrolls in-place, never affects the page */}
      <div className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide flex flex-col items-center">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
             <Loader2 className="w-12 h-12 text-manar-cyan animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-white/50">
            No videos available in the Arena right now.
          </div>
        ) : videos.map((vid, i) => (
          <motion.div
            key={vid.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="w-full h-full flex-shrink-0 snap-start flex items-center justify-center relative bg-black/20"
          >
            {/* The Video Frame — Large and prominent */}
            <div className={`relative w-[92%] h-[90%] aspect-[9/16] max-w-[500px] rounded-[2rem] overflow-hidden bg-black/80 border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)] group`}>
               {/* Click-to-interact overlay to prevent scroll trapping */}
               <div className="absolute inset-0 z-20 pointer-events-auto group-hover:pointer-events-none transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-0">
                  {/* This div catches the scroll wheel but disappears on hover so clicks work */}
               </div>

               {/* Embedded Iframe */}
               {getEmbedUrl(vid.url) ? (
                 <iframe 
                   src={`${getEmbedUrl(vid.url)}?autoplay=0&controls=1&modestbranding=1&loop=1`}
                   className="absolute inset-0 w-full h-full border-none"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 />
               ) : (
                 <Video className="w-24 h-24 text-white/10 absolute" />
               )}

               {/* Video Info overlay */}
               <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10 transition-transform group-hover:translate-y-2 duration-300">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-manar-cyan to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                      {vid.author?.charAt(0).toUpperCase()}
                   </div>
                   <h3 className="text-white font-bold text-lg tracking-tight drop-shadow-md">{vid.author}</h3>
                 </div>
                 <p className="text-white/90 text-sm mb-2 font-medium line-clamp-2">{vid.title}</p>
                 {vid.description && (
                   <p className="text-white/50 text-xs line-clamp-1 italic">{vid.description}</p>
                 )}
               </div>

               {/* Floating Action Buttons */}
               <div className="absolute ltr:right-5 rtl:left-5 bottom-24 flex flex-col gap-8 z-30">
                 <button className="flex flex-col items-center gap-2 group/btn active:scale-90 transition-transform">
                   <div className="w-14 h-14 rounded-full glass-panel-heavy flex items-center justify-center group-hover/btn:bg-red-500/30 group-hover/btn:border-red-500/50 transition-all border border-white/20 shadow-xl">
                     <Heart className="w-7 h-7 text-white fill-white/10" />
                   </div>
                   <span className="text-xs text-white/80 font-black tracking-widest">{vid.views || '0'}K</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 group/btn active:scale-90 transition-transform">
                   <div className="w-14 h-14 rounded-full glass-panel-heavy flex items-center justify-center group-hover/btn:bg-blue-500/30 group-hover/btn:border-blue-500/50 transition-all border border-white/20 shadow-xl">
                     <Share2 className="w-7 h-7 text-white" />
                   </div>
                   <span className="text-xs text-white/80 font-black tracking-widest uppercase">Share</span>
                 </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
