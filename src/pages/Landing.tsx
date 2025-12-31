/**
 * LANDING PAGE - TURAN Standard Pool
 * 
 * Professional landing page in McKinsey style:
 * - Minimalist design
 * - Large serif typography
 * - Generous white space
 * - Professional color palette
 * - Smooth animations
 * - Clear value propositions
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Users, 
  Building2,
  CheckCircle2,
  Target,
  Calendar,
  Award,
  Eye,
  ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl lg:text-2xl italic text-foreground">
                TURAN Standard Pool
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection('about')}
                className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors hidden md:block"
              >
                {t('landing.nav.about', 'О платформе')}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors hidden md:block"
              >
                {t('landing.nav.howItWorks', 'Как это работает')}
              </button>
              <Button
                onClick={() => navigate('/auth/login')}
                variant="ghost"
                className="text-sm font-normal tracking-wide text-foreground hover:bg-foreground/5 rounded-none h-9 px-6"
              >
                {t('landing.nav.login', 'Войти')}
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-9 px-6 text-sm font-normal"
              >
                {t('landing.nav.getStarted', 'Начать')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
          <div className="absolute top-0 left-[10%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[20%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[30%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[40%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[50%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[60%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[70%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[80%] w-px h-full bg-foreground" />
          <div className="absolute top-0 left-[90%] w-px h-full bg-foreground" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Main Content */}
            <div className="space-y-8 lg:space-y-12">
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-foreground leading-[1.05] italic">
                  {t('landing.hero.title', 'Координация рынка живого скота')}
                </h1>
                
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/60 font-light leading-relaxed max-w-2xl">
                  {t('landing.hero.subtitle', 'Управляемая платформа для обеспечения предсказуемости, стандартов и круглогодичных поставок для мясной отрасли Казахстана.')}
                </p>
              </div>

              {/* Key Points */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                  <p className="text-base text-foreground/70 font-light leading-relaxed">
                    {t('landing.hero.point1', 'Прозрачная координация между фермерами и мясоперерабатывающими комбинатами')}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                  <p className="text-base text-foreground/70 font-light leading-relaxed">
                    {t('landing.hero.point2', 'Система стандартов и премий за предсказуемость поставок')}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                  <p className="text-base text-foreground/70 font-light leading-relaxed">
                    {t('landing.hero.point3', 'Круглогодичное планирование и управление цепочками поставок')}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 px-8 text-sm font-normal tracking-wide group"
                >
                  {t('landing.hero.getStarted', 'Начать работу')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => scrollToSection('how-it-works')}
                  variant="outline"
                  className="border-foreground/20 text-foreground hover:bg-foreground/5 rounded-none h-12 px-8 text-sm font-normal tracking-wide"
                >
                  {t('landing.hero.learnMore', 'Узнать больше')}
                </Button>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {/* Large Feature Card */}
                <div className="col-span-2 bg-foreground/5 border border-foreground/10 p-8 hover:bg-foreground/8 transition-colors duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-foreground/60" />
                      <span className="text-xs tracking-[0.2em] uppercase text-foreground/50 font-medium">
                        {t('landing.hero.card1.label', 'Управляемая платформа')}
                  </span>
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl text-foreground italic leading-tight">
                      {t('landing.hero.card1.title', 'Рыночная координация с соблюдением стандартов')}
                    </h3>
                    <p className="text-sm text-foreground/60 font-light leading-relaxed">
                      {t('landing.hero.card1.description', 'Платформа обеспечивает прозрачность, предсказуемость и соблюдение стандартов качества на всех этапах цепочки поставок.')}
                    </p>
                  </div>
                </div>

                {/* Small Feature Cards */}
                <div className="bg-foreground/5 border border-foreground/10 p-6 hover:bg-foreground/8 transition-colors duration-300">
                  <div className="space-y-4">
                    <TrendingUp className="w-5 h-5 text-foreground/60" />
                    <div className="space-y-2">
                      <div className="h-px w-full bg-foreground/20" />
                      <div className="h-px w-3/4 bg-foreground/10" />
                      <div className="h-px w-1/2 bg-foreground/5" />
                    </div>
                    <p className="text-xs text-foreground/50 font-light">
                      {t('landing.hero.card2', 'Предсказуемость')}
                    </p>
                  </div>
                </div>

                <div className="bg-foreground/5 border border-foreground/10 p-6 hover:bg-foreground/8 transition-colors duration-300">
                  <div className="space-y-4">
                    <Award className="w-5 h-5 text-foreground/60" />
                    <div className="space-y-2">
                      <div className="h-px w-full bg-foreground/20" />
                      <div className="h-px w-3/4 bg-foreground/10" />
                    </div>
                    <p className="text-xs text-foreground/50 font-light">
                      {t('landing.hero.card3', 'Стандарты')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection('about')}
            className="flex flex-col items-center gap-2 text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-light">
              {t('landing.hero.scroll', 'Прокрутите вниз')}
            </span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs tracking-[0.2em] uppercase text-foreground/50 font-medium">
                  {t('landing.about.label', 'О платформе')}
                </span>
                <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-foreground italic leading-tight">
                  {t('landing.about.title', 'Рыночная координация нового поколения')}
                </h2>
              </div>
              
              <div className="space-y-6 text-base lg:text-lg text-foreground/70 font-light leading-relaxed">
                <p>
                  {t('landing.about.description1', 'TURAN Standard Pool — это управляемая платформа координации рынка живого скота, созданная для обеспечения предсказуемости, стандартов и круглогодичных поставок для мясной отрасли Казахстана.')}
                </p>
                <p>
                  {t('landing.about.description2', 'Платформа не является биржей или маркетплейсом. Это инструмент координации, который обеспечивает прозрачность, стандарты качества и эффективное сопоставление спроса и предложения при сохранении рыночной нейтральности.')}
                </p>
                <p>
                  {t('landing.about.description3', 'Все участники работают в рамках четко определенных правил, стандартов и процессов, обеспечивающих справедливость, прозрачность и предсказуемость для всех сторон.')}
                </p>
              </div>
            </div>

            {/* Right - Key Features */}
            <div className="space-y-6">
              <div className="border-l-2 border-foreground/20 pl-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-foreground/60" />
                    <h3 className="font-serif text-xl text-foreground italic">
                      {t('landing.about.feature1.title', 'Предсказуемость')}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.about.feature1.description', 'Круглогодичное планирование поставок с четкими окнами сопоставления и целевыми неделями.')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-foreground/60" />
                    <h3 className="font-serif text-xl text-foreground italic">
                      {t('landing.about.feature2.title', 'Стандарты')}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.about.feature2.description', 'Система стандартов качества и премий за соблюдение правил и предсказуемость поставок.')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-foreground/60" />
                    <h3 className="font-serif text-xl text-foreground italic">
                      {t('landing.about.feature3.title', 'Прозрачность')}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.about.feature3.description', 'Агрегированные сигналы спроса и предложения с сохранением конфиденциальности участников.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="space-y-16">
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs tracking-[0.2em] uppercase text-foreground/50 font-medium">
                {t('landing.howItWorks.label', 'Как это работает')}
                  </span>
              <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-foreground italic leading-tight">
                {t('landing.howItWorks.title', 'Процесс координации')}
              </h2>
              <p className="text-lg text-foreground/60 font-light leading-relaxed">
                {t('landing.howItWorks.subtitle', 'Три простых шага для эффективной координации поставок')}
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-foreground/20 text-foreground/60 font-serif text-xl">
                    1
                  </div>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-foreground italic">
                    {t('landing.howItWorks.step1.title', 'Объявление доступности')}
                  </h3>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.howItWorks.step1.description', 'Фермеры объявляют партии скота с указанием характеристик, региона и целевой недели поставки.')}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <Users className="w-4 h-4" />
                    <span>{t('landing.howItWorks.step1.role', 'Для фермеров')}</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-foreground/20 text-foreground/60 font-serif text-xl">
                    2
                  </div>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-foreground italic">
                    {t('landing.howItWorks.step2.title', 'Формирование пулов')}
                  </h3>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.howItWorks.step2.description', 'МПК создают заявки на закупку, а платформа сопоставляет их с доступными партиями в рамках окон сопоставления.')}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <Building2 className="w-4 h-4" />
                    <span>{t('landing.howItWorks.step2.role', 'Для МПК')}</span>
                  </div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-foreground/20 text-foreground/60 font-serif text-xl">
                    3
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-foreground italic">
                    {t('landing.howItWorks.step3.title', 'Исполнение контрактов')}
                  </h3>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.howItWorks.step3.description', 'После сопоставления стороны переходят к исполнению: планирование поставки, подтверждение соответствия и расчеты.')}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('landing.howItWorks.step3.role', 'Для всех участников')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left - Benefits List */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs tracking-[0.2em] uppercase text-foreground/50 font-medium">
                  {t('landing.benefits.label', 'Преимущества')}
                </span>
                <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-foreground italic leading-tight">
                  {t('landing.benefits.title', 'Почему TURAN Standard Pool')}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-foreground/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground italic mb-1">
                      {t('landing.benefits.benefit1.title', 'Предсказуемость поставок')}
                    </h3>
                    <p className="text-sm text-foreground/60 font-light leading-relaxed">
                      {t('landing.benefits.benefit1.description', 'Круглогодичное планирование с четкими окнами сопоставления и целевыми неделями.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-foreground/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground italic mb-1">
                      {t('landing.benefits.benefit2.title', 'Система стандартов')}
                    </h3>
                    <p className="text-sm text-foreground/60 font-light leading-relaxed">
                      {t('landing.benefits.benefit2.description', 'Четкие стандарты качества и премии за соблюдение правил и предсказуемость.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-foreground/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground italic mb-1">
                      {t('landing.benefits.benefit3.title', 'Прозрачность рынка')}
                    </h3>
                    <p className="text-sm text-foreground/60 font-light leading-relaxed">
                      {t('landing.benefits.benefit3.description', 'Агрегированные сигналы спроса и предложения с сохранением конфиденциальности.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-foreground/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground italic mb-1">
                      {t('landing.benefits.benefit4.title', 'Управляемая координация')}
                    </h3>
                    <p className="text-sm text-foreground/60 font-light leading-relaxed">
                      {t('landing.benefits.benefit4.description', 'Централизованная координация с соблюдением правил и стандартов для всех участников.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="space-y-6">
              <div className="bg-foreground/5 border border-foreground/10 p-8 lg:p-12 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-[0.2em] uppercase text-foreground/50 font-medium">
                      {t('landing.benefits.stats.label', 'Платформа')}
                  </span>
                    <Calendar className="w-5 h-5 text-foreground/40" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-px w-full bg-foreground/20" />
                    <div className="h-px w-4/5 bg-foreground/15" />
                    <div className="h-px w-3/5 bg-foreground/10" />
                    <div className="h-px w-2/5 bg-foreground/5" />
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <div>
                    <p className="text-xs text-foreground/50 font-light mb-1">
                      {t('landing.benefits.stats.item1', 'Круглогодичное планирование')}
                    </p>
                    <div className="h-1 bg-foreground/10 w-full">
                      <div className="h-full bg-foreground/30 w-4/5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/50 font-light mb-1">
                      {t('landing.benefits.stats.item2', 'Окна сопоставления')}
                    </p>
                    <div className="h-1 bg-foreground/10 w-full">
                      <div className="h-full bg-foreground/30 w-3/5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/50 font-light mb-1">
                      {t('landing.benefits.stats.item3', 'Стандарты качества')}
                    </p>
                    <div className="h-1 bg-foreground/10 w-full">
                      <div className="h-full bg-foreground/30 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-24 lg:py-32 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="space-y-16">
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs tracking-[0.2em] uppercase text-foreground/50 font-medium">
                {t('landing.forWhom.label', 'Для кого')}
              </span>
              <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-foreground italic leading-tight">
                {t('landing.forWhom.title', 'Участники платформы')}
              </h2>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Farmer Card */}
              <div className="bg-white border border-foreground/10 p-8 lg:p-12 hover:border-foreground/20 transition-colors duration-300">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-foreground/5 border border-foreground/10">
                      <Users className="w-6 h-6 text-foreground/60" />
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl text-foreground italic">
                      {t('landing.forWhom.farmer.title', 'Фермеры')}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.forWhom.farmer.description', 'Объявляйте партии скота, участвуйте в сопоставлении пулов и получайте премии за соблюдение стандартов и предсказуемость поставок.')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                      <span className="text-xs text-foreground/60 font-light">
                        {t('landing.forWhom.farmer.benefit1', 'Объявление партий скота')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                      <span className="text-xs text-foreground/60 font-light">
                        {t('landing.forWhom.farmer.benefit2', 'Участие в сопоставлении пулов')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                      <span className="text-xs text-foreground/60 font-light">
                        {t('landing.forWhom.farmer.benefit3', 'Премии за стандарты и предсказуемость')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* MPK Card */}
              <div className="bg-white border border-foreground/10 p-8 lg:p-12 hover:border-foreground/20 transition-colors duration-300">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-foreground/5 border border-foreground/10">
                      <Building2 className="w-6 h-6 text-foreground/60" />
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl text-foreground italic">
                      {t('landing.forWhom.mpk.title', 'МПК')}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {t('landing.forWhom.mpk.description', 'Создавайте заявки на закупку, отслеживайте доступное предложение и координируйте закупки через управляемые пулы.')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                      <span className="text-xs text-foreground/60 font-light">
                        {t('landing.forWhom.mpk.benefit1', 'Создание заявок на закупку')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                      <span className="text-xs text-foreground/60 font-light">
                        {t('landing.forWhom.mpk.benefit2', 'Отслеживание предложения')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                      <span className="text-xs text-foreground/60 font-light">
                        {t('landing.forWhom.mpk.benefit3', 'Координация через пулы')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl italic leading-tight">
              {t('landing.cta.title', 'Готовы начать?')}
            </h2>
            <p className="text-lg lg:text-xl text-background/80 font-light leading-relaxed">
              {t('landing.cta.description', 'Присоединяйтесь к платформе TURAN Standard Pool и станьте частью современной системы координации рынка живого скота.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-background text-foreground hover:bg-background/90 rounded-none h-12 px-8 text-sm font-normal tracking-wide group"
              >
                {t('landing.cta.getStarted', 'Начать работу')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/auth/login')}
                variant="outline"
                className="border-background/20 text-background hover:bg-background/10 rounded-none h-12 px-8 text-sm font-normal tracking-wide"
              >
                {t('landing.cta.login', 'Войти на платформу')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 lg:py-16 border-t border-foreground/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg italic text-foreground/60">
                TURAN Standard Pool
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-foreground/50 font-light">
              <span>{t('landing.footer.copyright', '© 2025 TURAN Standard Pool')}</span>
              <span className="hidden md:inline">•</span>
              <span>{t('landing.footer.rights', 'Все права защищены')}</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
}
