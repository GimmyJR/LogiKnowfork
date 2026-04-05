'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Sparkles, Bot, User, Anchor } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatBot({ inlineMode = false }: { inlineMode?: boolean }) {
  const t = useTranslations('Chatbot');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add greeting message on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: t('greeting'),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, hasGreeted, t]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build messages array for the API (exclude greeting if it's system-generated)
      const chatHistory = [...messages.filter((m) => m.id !== 'greeting'), userMessage].map(
        (m) => ({ role: m.role, content: m.content })
      );

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show detail for debugging (e.g. "API key invalid", "quota exceeded")
        const detail = data.detail ? ` — ${data.detail}` : '';
        throw new Error(`${data.error || t('error')}${detail} (HTTP ${res.status})`);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: err.message || t('error'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`${inlineMode ? 'relative' : 'fixed bottom-6 right-6 rtl:right-auto rtl:left-6'} z-50 w-16 h-16 rounded-full bg-gradient-to-br from-manar-cyan to-manar-blue flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-shadow duration-300 chatbot-pulse-ring`}
            id="chatbot-toggle-button"
            aria-label="Open chatbot"
          >
            <Bot className="w-7 h-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed ${inlineMode ? 'bottom-6 left-6 rtl:left-auto rtl:right-6 lg:left-[5%] lg:rtl:right-[5%]' : 'bottom-6 right-6 rtl:right-auto rtl:left-6'} z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl overflow-hidden`}
            style={{
              background: 'linear-gradient(135deg, rgba(10, 14, 26, 0.95) 0%, rgba(15, 23, 42, 0.92) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
            id="chatbot-window"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-manar-cyan/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-manar-cyan/30 to-manar-blue/30 border border-manar-cyan/30 flex items-center justify-center">
                  <Anchor className="w-5 h-5 text-manar-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{t('title')}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-white/50 font-medium">{t('online')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                aria-label="Close chatbot"
                id="chatbot-close-button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-manar-gold/20 border border-manar-gold/30'
                        : 'bg-manar-cyan/20 border border-manar-cyan/30'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-manar-gold" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-manar-cyan" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-manar-gold/20 to-manar-gold/10 border border-manar-gold/20 text-white'
                        : 'bg-white/5 border border-white/10 text-white/90'
                    }`}
                  >
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-manar-cyan/20 border border-manar-cyan/30 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-manar-cyan" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-1.5">
                    <span className="chatbot-typing-dot w-2 h-2 rounded-full bg-manar-cyan/60" style={{ animationDelay: '0ms' }} />
                    <span className="chatbot-typing-dot w-2 h-2 rounded-full bg-manar-cyan/60" style={{ animationDelay: '150ms' }} />
                    <span className="chatbot-typing-dot w-2 h-2 rounded-full bg-manar-cyan/60" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1 focus-within:border-manar-cyan/40 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('placeholder')}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none placeholder:text-white/30 disabled:opacity-50"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  id="chatbot-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-manar-cyan to-manar-blue flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all"
                  aria-label={t('send')}
                  id="chatbot-send-button"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-white/25 text-center mt-2 font-medium">
                {t('poweredBy')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
