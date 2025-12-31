/**
 * LANDING PAGE - TURAN Standard Pool
 * 
 * McKinsey-style institutional design:
 * - Enhanced institutional branding
 * - Improved CTA contrast
 * - Flat, minimal icons
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  TrendingUp,
  Shield,
  BarChart3,
  Network
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#0a1628] flex flex-col overflow-hidden">
      {/* Hero Section - Optimized for single viewport */}
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 xl:px-20 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-6 space-y-8">
              {/* Brand Header - Aligned with H1 */}
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-white/30" />
                <div>
                  <div className="font-serif text-2xl lg:text-3xl text-white italic tracking-tight font-normal leading-none">
                    TURAN
                  </div>
                  <div className="text-[9px] lg:text-[10px] tracking-[0.3em] uppercase text-white/50 font-medium leading-none mt-1">
                    STANDARD POOL
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white leading-[1.1] tracking-[-0.02em]">
                {t('landing.hero.title', 'Координация рынка живого скота')}
              </h1>
              
              {/* Subheadline */}
              <p className="text-base md:text-lg lg:text-xl text-white/70 font-light leading-[1.6] max-w-xl">
                {t('landing.hero.subtitle', 'Управляемая платформа для обеспечения предсказуемости, стандартов и круглогодичных поставок для мясной отрасли Казахстана.')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-white text-[#0a1628] hover:bg-white/95 h-12 px-8 text-sm font-medium tracking-wide rounded-none group transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('landing.hero.getStarted', 'Начать работу')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                <Button
                  onClick={() => navigate('/auth/login')}
                  variant="outline"
                  className="border-white/40 bg-white/5 text-white hover:bg-white/10 hover:border-white/60 h-12 px-8 text-sm font-medium tracking-wide rounded-none transition-all duration-200"
                >
                  {t('landing.nav.login', 'Войти')}
                </Button>
              </div>
            </div>

            {/* Right Column - Enhanced Editorial Cards Grid with Icons */}
            <div className="lg:col-span-6 hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: Predictability - Spans 2 columns */}
                <div className="col-span-2 bg-white/5 border border-white/10 p-6 hover:bg-white/8 hover:border-white/15 transition-all duration-300 cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white/60 stroke-[1.5]" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium leading-tight">
                        PLATFORM CAPABILITY
                      </div>
                      <h3 className="font-serif text-xl lg:text-2xl text-white italic leading-[1.2] font-normal">
                        Предсказуемость поставок
                      </h3>
                      <p className="text-xs text-white/60 font-light leading-[1.5]">
                        Круглогодичное планирование через окна сопоставления и целевые недели
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Standards */}
                <div className="bg-white/5 border border-white/10 p-5 hover:bg-white/8 hover:border-white/15 transition-all duration-300 cursor-default">
                  <div className="space-y-2.5">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm mb-2">
                      <Shield className="w-4 h-4 text-white/60 stroke-[1.5]" />
                    </div>
                    <div className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-medium leading-tight">
                      QUALITY SYSTEM
                    </div>
                    <h3 className="font-serif text-lg lg:text-xl text-white italic leading-[1.2] font-normal">
                      Стандарты
                    </h3>
                    <p className="text-xs text-white/60 font-light leading-[1.5]">
                      Единые требования качества и система премий
                    </p>
                  </div>
                </div>

                {/* Card 3: Transparency */}
                <div className="bg-white/5 border border-white/10 p-5 hover:bg-white/8 hover:border-white/15 transition-all duration-300 cursor-default">
                  <div className="space-y-2.5">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm mb-2">
                      <BarChart3 className="w-4 h-4 text-white/60 stroke-[1.5]" />
                    </div>
                    <div className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-medium leading-tight">
                      MARKET INTELLIGENCE
                    </div>
                    <h3 className="font-serif text-lg lg:text-xl text-white italic leading-[1.2] font-normal">
                      Прозрачность
                    </h3>
                    <p className="text-xs text-white/60 font-light leading-[1.5]">
                      Агрегированные сигналы спроса и предложения
                    </p>
                  </div>
                </div>

                {/* Card 4: Coordination - Spans 2 columns */}
                <div className="col-span-2 bg-white/5 border border-white/10 p-6 hover:bg-white/8 hover:border-white/15 transition-all duration-300 cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm flex-shrink-0">
                      <Network className="w-5 h-5 text-white/60 stroke-[1.5]" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium leading-tight">
                        GOVERNANCE
                      </div>
                      <h3 className="font-serif text-xl lg:text-2xl text-white italic leading-[1.2] font-normal">
                        Координация
                      </h3>
                      <p className="text-xs text-white/60 font-light leading-[1.5]">
                        Управляемое взаимодействие участников рынка в рамках единых правил
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Cards - Optimized with Icons */}
      <div className="lg:hidden px-8 pb-12">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 bg-white/5 border border-white/10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white/60 stroke-[1.5]" />
              </div>
              <div className="space-y-2.5 flex-1">
                <div className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-medium leading-tight">
                  PLATFORM CAPABILITY
                </div>
                <h3 className="font-serif text-lg text-white italic leading-[1.2] font-normal">
                  Предсказуемость поставок
                </h3>
                <p className="text-xs text-white/60 font-light leading-[1.5]">
                  Круглогодичное планирование через окна сопоставления
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4">
            <div className="space-y-2">
              <div className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm mb-1.5">
                <Shield className="w-3.5 h-3.5 text-white/60 stroke-[1.5]" />
              </div>
              <div className="text-[8px] tracking-[0.15em] uppercase text-white/50 font-medium leading-tight">
                QUALITY SYSTEM
              </div>
              <h3 className="font-serif text-base text-white italic leading-[1.2] font-normal">
                Стандарты
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4">
            <div className="space-y-2">
              <div className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm mb-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-white/60 stroke-[1.5]" />
              </div>
              <div className="text-[8px] tracking-[0.15em] uppercase text-white/50 font-medium leading-tight">
                MARKET INTELLIGENCE
              </div>
              <h3 className="font-serif text-base text-white italic leading-[1.2] font-normal">
                Прозрачность
              </h3>
            </div>
          </div>

          <div className="col-span-2 bg-white/5 border border-white/10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm flex-shrink-0">
                <Network className="w-4 h-4 text-white/60 stroke-[1.5]" />
              </div>
              <div className="space-y-2.5 flex-1">
                <div className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-medium leading-tight">
                  GOVERNANCE
                </div>
                <h3 className="font-serif text-lg text-white italic leading-[1.2] font-normal">
                  Координация
                </h3>
                <p className="text-xs text-white/60 font-light leading-[1.5]">
                  Управляемое взаимодействие участников рынка
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
