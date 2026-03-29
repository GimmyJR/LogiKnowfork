'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { BookOpen, Library, GraduationCap, PenSquare, Menu, X, Anchor, LogOut, User, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function TopNav() {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('Auth');
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home'), icon: null },
    { href: '/books', label: t('books'), icon: <Library className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> },
    { href: '/academic', label: t('academic'), icon: <GraduationCap className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> },
    { href: '/submit', label: t('submit'), icon: <PenSquare className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> }
  ];

  if (user && (user.roles.includes('Admin') || user.roles.includes('Moderator'))) {
    navItems.push({ href: '/admin', label: t('admin'), icon: <ShieldCheck className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> });
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel sticky top-4 z-50 mx-4 mt-4 rounded-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center pr-8 rtl:pr-0 rtl:pl-8">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-white whitespace-nowrap">
              <Anchor className="w-8 h-8 flex-shrink-0 text-manar-cyan" />
              <span>MANARA <span className="text-sm font-normal text-manar-gold">منارة</span></span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:space-x-8 md:items-center h-full rtl:space-x-reverse">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-all duration-300
                  ${pathname === item.href 
                    ? 'border-manar-cyan text-white font-bold' 
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/40'
                  }`}
              >
                <span>{item.label}</span>
                {item.icon}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex ml-auto rtl:ml-0 rtl:mr-auto pl-4 rtl:pl-0 rtl:pr-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r border-white/20 rtl:border-r-0 rtl:border-l pr-4 rtl:pr-0 rtl:pl-4">
                <Link href="/" locale="ar" className={`text-sm hover:text-white px-1 font-bold transition-colors ${pathname.startsWith('/ar') ? 'text-white' : 'text-white/60'}`}>عربي</Link>
                <Link href="/" locale="en" className={`text-sm hover:text-white px-1 font-bold border-x border-white/20 transition-colors ${pathname.startsWith('/en') ? 'text-white' : 'text-white/60'}`}>EN</Link>
                <Link href="/" locale="fr" className={`text-sm hover:text-white px-1 font-bold transition-colors ${pathname.startsWith('/fr') ? 'text-white' : 'text-white/60'}`}>FR</Link>
              </div>
              
              {!loading && (
                isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end rtl:items-start text-xs">
                      <span className="font-bold text-white">{user.fullName || user.email.split('@')[0]}</span>
                      <span className="text-white/60">{user.roles.includes('Admin') ? 'Admin' : user.roles.includes('Moderator') ? 'Moderator' : 'User'}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-manar-cyan/20 border border-manar-cyan/50 flex items-center justify-center text-manar-cyan font-bold pb-0.5">
                      {(user.fullName || user.email)[0].toUpperCase()}
                    </div>
                    <button 
                      onClick={() => logout()}
                      className="text-xs text-red-400 hover:text-red-300 ml-2 rtl:ml-0 rtl:mr-2 transition-colors"
                    >
                      {tAuth('logout')}
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="manar-btn-gold px-4 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105">
                    {tAuth('login')}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden border-t border-white/10"
        >
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href as any}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-base font-medium
                  ${pathname === item.href 
                    ? 'bg-manar-cyan/10 text-white font-bold border-l-4 border-manar-cyan rtl:border-r-4 rtl:border-l-0' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span>{item.label}</span>
                {item.icon}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 mt-2">
              <Link href="/" locale="ar" className="text-sm text-white/60 hover:text-white px-2 font-bold transition-colors">عربي</Link>
              <Link href="/" locale="en" className="text-sm text-white/60 hover:text-white px-2 font-bold border-x border-white/20 transition-colors">EN</Link>
              <Link href="/" locale="fr" className="text-sm text-white/60 hover:text-white px-2 font-bold transition-colors">FR</Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
