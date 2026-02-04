/**
 * LandingNav - Institutional Navigation for TSP Landing Page
 *
 * Design: Blackstone/BRS inspired
 * - Sticky header with transparent → solid transition
 * - Mobile hamburger menu
 * - Playfair Display for logo
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TuranIcon } from '@/components/icons/TuranIcon';

interface LandingNavProps {
  variant?: 'dark' | 'light';
}

export function LandingNav({ variant = 'dark' }: LandingNavProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'about', label: t('landing.nav.about', 'О системе'), href: '#about' },
    { key: 'howItWorks', label: t('landing.nav.howItWorks', 'Как работает'), href: '#how-it-works' },
    { key: 'standards', label: t('landing.nav.standards', 'Стандарты'), href: '#standards' },
    { key: 'participants', label: t('landing.nav.participants', 'Участники'), href: '#participants' },
  ];

  const isDark = variant === 'dark';
  const bgClass = isScrolled
    ? isDark ? 'bg-[#0A0A0A]/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm shadow-sm'
    : 'bg-transparent';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <TuranIcon size={36} />
              <div>
                <div className={`font-landing-heading text-lg lg:text-xl font-medium tracking-tight ${textClass}`}>
                  TURAN
                </div>
                <div className={`text-[8px] lg:text-[9px] tracking-[0.2em] uppercase ${isDark ? 'text-white/50' : 'text-gray-400'} font-medium`}>
                  STANDARD POOL
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${textMutedClass}`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                onClick={() => navigate('/auth/login')}
                variant="ghost"
                className={`text-sm font-medium ${textMutedClass} hover:bg-transparent`}
              >
                {t('landing.nav.platform', 'Платформа')}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 ${textClass}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={`absolute top-16 right-0 w-64 h-[calc(100vh-4rem)] ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'} shadow-xl`}>
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 text-base font-medium border-b ${isDark ? 'text-white/80 border-white/10' : 'text-gray-700 border-gray-100'}`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4">
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth/login');
                  }}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full h-12 font-medium"
                >
                  {t('landing.nav.platform', 'Платформа')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LandingNav;
