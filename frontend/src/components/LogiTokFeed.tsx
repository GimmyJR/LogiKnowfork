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
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden relative">
      <div className="flex justify-between items-center px-6 py-4 z-10 bg-black/40 backdrop-blur-md border-b border-white/5">
        <h2 className="text-2xl font-black text-white glow-text italic">MANARA Arena</h2>
        <span className="px-4 py-1 rounded-full glass-panel text-xs text-manar-cyan font-bold tracking-widest border-manar-cyan/50">LIVE PITCHES</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 snap-y snap-mandatory scrollbar-hide px-4 flex flex-col gap-6 pt-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <Loader2 className="w-12 h-12 text-manar-cyan animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/50">
            No videos available in the Arena right now.
          </div>
        ) : videos.map((vid, i) => (
          <motion.div
            key={vid.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
            className={`w-full aspect-[9/16] max-h-[75vh] rounded-3xl snap-center relative overflow-hidden bg-black/50 border border-white/10 shadow-2xl flex items-center justify-center group`}
          >
            {/* Embedded Iframe */}
            {getEmbedUrl(vid.url) ? (
              <iframe 
                src={`${getEmbedUrl(vid.url)}?autoplay=0&controls=0&modestbranding=1&loop=1`}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Video className="w-24 h-24 text-white/10 absolute" />
            )}

            {/* Video Info overlay (pointer-events-none so we can pause/play the iframe underneath) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
              <h3 className="text-white font-bold text-lg mb-1">{vid.author}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{vid.title}</p>
              {vid.description && (
                <p className="text-white/60 text-xs mb-4 line-clamp-1">{vid.description}</p>
              )}
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute ltr:right-4 rtl:left-4 bottom-24 flex flex-col gap-6 z-10 pointer-events-auto">
              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover/btn:bg-red-500/20 transition-colors">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-white font-bold">{vid.views || '0'}</span>
              </button>
              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover/btn:bg-blue-500/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-white font-bold">Share</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
