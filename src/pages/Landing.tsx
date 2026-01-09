/**
 * LANDING PAGE - TURAN Standard Pool
 *
 * Institutional Infrastructure Design (Blackstone/BRS inspired)
 *
 * TSP is INFRASTRUCTURE, not a marketplace.
 *
 * Design principles:
 * - Playfair Display for headings (serif)
 * - DM Sans for body (sans-serif)
 * - Dark hero (#0A0A0A)
 * - Pill buttons for primary CTA
 * - Sharp corners for cards
 * - Institutional tone, no promotional language
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LandingNav, ParticipantCard, BoundaryList } from '@/components/landing';
import {
  ArrowRight,
  Wheat,
  Factory,
  Building2,
  Handshake,
  FileText,
  Scale,
  Shield,
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Participant data
  const participants = [
    {
      key: 'farmers',
      icon: Wheat,
      title: t('landing.participants.farmers.title', 'Фермерам'),
      subtitle: t('landing.participants.farmers.subtitle', 'Координация поставок'),
      items: t('landing.participants.farmers.items', { returnObjects: true }) as string[] || [
        'Заявление о доступности скота',
        'Формирование обязательств',
        'Планирование поставок',
      ],
      cta: t('landing.participants.farmers.cta', 'Подробнее для фермеров'),
      href: '/auth',
    },
    {
      key: 'processors',
      icon: Factory,
      title: t('landing.participants.processors.title', 'Переработчикам'),
      subtitle: t('landing.participants.processors.subtitle', 'Координация закупок'),
      items: t('landing.participants.processors.items', { returnObjects: true }) as string[] || [
        'Сигнализация потребности',
        'Участие в пулах',
        'Управление приёмкой',
      ],
      cta: t('landing.participants.processors.cta', 'Подробнее для переработчиков'),
      href: '/auth',
    },
    {
      key: 'institutions',
      icon: Building2,
      title: t('landing.participants.institutions.title', 'Институтам'),
      subtitle: t('landing.participants.institutions.subtitle', 'Программная поддержка'),
      items: t('landing.participants.institutions.items', { returnObjects: true }) as string[] || [
        'Отраслевой анализ',
        'Нормативное содействие',
        'Экспертная оценка',
      ],
      cta: t('landing.participants.institutions.cta', 'Связаться с нами'),
      href: '#contact',
    },
    {
      key: 'partners',
      icon: Handshake,
      title: t('landing.participants.partners.title', 'Партнёрам'),
      subtitle: t('landing.participants.partners.subtitle', 'Техническое содействие'),
      items: t('landing.participants.partners.items', { returnObjects: true }) as string[] || [
        'Интеграционные возможности',
        'Аналитические данные',
        'Операционная поддержка',
      ],
      cta: t('landing.participants.partners.cta', 'Партнёрская программа'),
      href: '#contact',
    },
  ];

  // Boundary items
  const boundaryItems = t('landing.boundaries.items', { returnObjects: true }) as string[] || [
    'Не является биржей или маркетплейсом',
    'Не устанавливает и не гарантирует цены',
    'Не выступает стороной сделок',
    'Не предоставляет финансовых гарантий',
    'Не осуществляет торговое посредничество',
    'Не принимает решений за участников',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          SECTION 1: DARK HERO
          ============================================ */}
      <section className="relative min-h-screen bg-[#0A0A0A] text-white">
        <LandingNav variant="dark" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="max-w-3xl">
            {/* Brand Mark */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-0.5 h-12 bg-white/30" />
              <div>
                <div className="font-landing-heading text-2xl lg:text-3xl font-medium tracking-tight">
                  TURAN
                </div>
                <div className="text-[10px] lg:text-[11px] tracking-[0.25em] uppercase text-white/50 font-medium mt-0.5">
                  STANDARD POOL
                </div>
              </div>
            </div>

            {/* Institutional Statement */}
            <h1 className="font-landing-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.15] tracking-tight mb-8">
              {t('landing.hero.statement', 'Инфраструктура координации рынка живого скота Казахстана, обеспечивающая предсказуемость обязательств и прозрачность операций.')}
            </h1>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full h-12 px-8 text-base font-medium transition-all hover:-translate-y-0.5 group"
              >
                {t('landing.hero.cta.primary', 'Узнать об участии')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/auth/login')}
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 rounded-full h-12 px-8 text-base font-medium transition-all"
              >
                {t('landing.hero.cta.secondary', 'Войти на платформу')}
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-12 bg-white/20" />
        </div>
      </section>

      {/* ============================================
          SECTION 2: SYSTEM DEFINITION
          ============================================ */}
      <section id="about" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Section Label */}
            <div className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              {t('landing.systemDefinition.label', 'О системе')}
            </div>

            {/* Title */}
            <h2 className="font-landing-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-8">
              {t('landing.systemDefinition.title', 'Что такое TURAN Standard Pool')}
            </h2>

            {/* Not Exchange Disclaimer */}
            <p className="text-xl lg:text-2xl text-gray-900 font-medium mb-6">
              {t('landing.systemDefinition.notExchange', 'TSP — это не биржа, не маркетплейс и не торговая площадка.')}
            </p>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {t('landing.systemDefinition.description', 'TSP — это инфраструктура координации, позволяющая участникам мясной отрасли заявлять о намерениях, формировать обязательства и планировать поставки в рамках единых стандартов и правил.')}
            </p>

            {/* Disclaimer */}
            <p className="text-base text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-4">
              {t('landing.systemDefinition.disclaimer', 'Система не устанавливает цены, не гарантирует сделки и не выступает стороной коммерческих отношений между участниками.')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: EXPLICIT BOUNDARIES
          ============================================ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Title */}
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
                {t('landing.boundaries.label', 'Ограничения')}
              </div>
              <h2 className="font-landing-heading text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-4">
                {t('landing.boundaries.title', 'Чего TSP не делает')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('landing.boundaries.subtitle', 'Явные границы системы координации')}
              </p>
            </div>

            {/* Right: Boundary List */}
            <div>
              <BoundaryList items={boundaryItems} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 4: PARTICIPANT PATHWAYS
          ============================================ */}
      <section id="participants" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              {t('landing.participants.label', 'Участники')}
            </div>
            <h2 className="font-landing-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-4">
              {t('landing.participants.title', 'Для кого создана система')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.participants.subtitle', 'Добровольное участие в координации рынка')}
            </p>
          </div>

          {/* Participant Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {participants.map((participant) => (
              <ParticipantCard
                key={participant.key}
                icon={participant.icon}
                title={participant.title}
                subtitle={participant.subtitle}
                items={participant.items}
                cta={participant.cta}
                onClick={() => navigate(participant.href)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: GOVERNANCE
          ============================================ */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-white/40 font-medium mb-4">
                {t('landing.governance.label', 'Управление')}
              </div>
              <h2 className="font-landing-heading text-3xl md:text-4xl font-semibold text-white leading-tight mb-6">
                {t('landing.governance.title', 'Управление и поддержка')}
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                {t('landing.governance.description', 'TSP управляется ассоциационной структурой с участием представителей всех сторон рынка.')}
              </p>

              {/* Governance Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-none">
                    <Scale className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-white/80">
                    {t('landing.governance.regulatory', 'Соответствие нормативным требованиям')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-none">
                    <Shield className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-white/80">
                    {t('landing.governance.transparency', 'Прозрачность правил и процессов')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Association Badge */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/5 border border-white/10 rounded-none p-8 lg:p-12 text-center max-w-sm">
                <div className="text-xs tracking-[0.2em] uppercase text-white/40 font-medium mb-4">
                  {t('landing.governance.label', 'Управление')}
                </div>
                <p className="text-xl lg:text-2xl text-white font-landing-heading font-medium">
                  {t('landing.governance.association', 'При поддержке отраслевого сообщества')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: FOOTER
          ============================================ */}
      <footer className="py-12 lg:py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-0.5 h-8 bg-white/30" />
                <div>
                  <div className="font-landing-heading text-lg font-medium">TURAN</div>
                  <div className="text-[8px] tracking-[0.2em] uppercase text-white/50">STANDARD POOL</div>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                {t('landing.governance.description', 'TSP управляется ассоциационной структурой с участием представителей всех сторон рынка.')}
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">
                {t('landing.footer.documentation', 'Документация')}
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="/docs" className="text-sm text-white/50 hover:text-white transition-colors">
                    {t('landing.footer.documentation', 'Документация')}
                  </a>
                </li>
                <li>
                  <a href="#standards" className="text-sm text-white/50 hover:text-white transition-colors">
                    {t('landing.footer.standards', 'Стандарты')}
                  </a>
                </li>
                <li>
                  <a href="#governance" className="text-sm text-white/50 hover:text-white transition-colors">
                    {t('landing.footer.governance', 'Управление')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">
                {t('common.legal', 'Правовая информация')}
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#terms" className="text-sm text-white/50 hover:text-white transition-colors">
                    {t('landing.footer.terms', 'Условия использования')}
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-sm text-white/50 hover:text-white transition-colors">
                    {t('landing.footer.privacy', 'Политика конфиденциальности')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">
                {t('landing.footer.contact', 'Контакты')}
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-white/50">
                  info@turanstandard.kz
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-sm text-white/40 text-center">
              {t('landing.footer.copyright', '© 2025 TURAN Standard Pool. Все права защищены.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
