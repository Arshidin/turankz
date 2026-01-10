/**
 * LANDING PAGE V2 - TURAN Standard Pool
 *
 * Institutional Infrastructure Design per CLAUDE_CODE_INSTRUCTIONS_V2.md
 *
 * TSP is INFRASTRUCTURE, not a marketplace.
 *
 * Structure (7 sections):
 * 1. Hero (dark) - Italic headline, brand mark
 * 2. What TSP Is (light) - Asymmetric 1:2 grid, numbered principles
 * 3. What TSP Does NOT Do (dark) - ELEVATED, 3x2 card grid with icons
 * 4. How It Works (light/gray) - 5-step horizontal process
 * 5. Participant Pathways (light) - 4 pathway cards
 * 6. Governance (dark) - Association backing
 * 7. Footer (dark) - 4-column grid
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  LandingNav,
  ParticipantCard,
  PrincipleCard,
  BoundaryCard,
  ProcessStep,
} from '@/components/landing';
import {
  ArrowRight,
  Wheat,
  Factory,
  Building2,
  Handshake,
  Scale,
  Shield,
  Ban,
  CircleDollarSign,
  FileX,
  ShieldX,
  Users,
  HandCoins,
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Principles data (numbered 01, 02, 03)
  const principles = [
    {
      number: '01',
      title: t('landing.principles.association.title', 'Ассоциационное управление'),
      description: t('landing.principles.association.description', 'Управляется отраслевым сообществом с представительством всех участников рынка.'),
    },
    {
      number: '02',
      title: t('landing.principles.standards.title', 'Единые стандарты'),
      description: t('landing.principles.standards.description', 'Общие правила классификации, качества и процедур для всех участников.'),
    },
    {
      number: '03',
      title: t('landing.principles.transparency.title', 'Прозрачность операций'),
      description: t('landing.principles.transparency.description', 'Открытые правила координации без скрытых условий или преференций.'),
    },
  ];

  // Boundary cards data (What TSP Does NOT Do)
  const boundaryCards = [
    {
      icon: Ban,
      title: t('landing.boundaryCards.noExchange.title', 'Не является биржей'),
      description: t('landing.boundaryCards.noExchange.description', 'TSP не является торговой площадкой, биржей или маркетплейсом.'),
    },
    {
      icon: CircleDollarSign,
      title: t('landing.boundaryCards.noPricing.title', 'Не устанавливает цены'),
      description: t('landing.boundaryCards.noPricing.description', 'Система не определяет, не фиксирует и не гарантирует цены сделок.'),
    },
    {
      icon: FileX,
      title: t('landing.boundaryCards.noParty.title', 'Не сторона сделок'),
      description: t('landing.boundaryCards.noParty.description', 'TSP не выступает покупателем, продавцом или посредником в сделках.'),
    },
    {
      icon: ShieldX,
      title: t('landing.boundaryCards.noGuarantees.title', 'Нет финансовых гарантий'),
      description: t('landing.boundaryCards.noGuarantees.description', 'Система не предоставляет страховку, гарантии или финансовое обеспечение.'),
    },
    {
      icon: Users,
      title: t('landing.boundaryCards.noMediation.title', 'Нет посредничества'),
      description: t('landing.boundaryCards.noMediation.description', 'Торговое посредничество и брокерские услуги не предоставляются.'),
    },
    {
      icon: HandCoins,
      title: t('landing.boundaryCards.noDecisions.title', 'Не принимает решений'),
      description: t('landing.boundaryCards.noDecisions.description', 'Все коммерческие решения принимаются участниками самостоятельно.'),
    },
  ];

  // Process steps (How It Works)
  const processSteps = [
    {
      number: 1,
      title: t('landing.process.eligibility.title', 'Проверка'),
      description: t('landing.process.eligibility.description', 'Участник проверяет соответствие критериям'),
    },
    {
      number: 2,
      title: t('landing.process.declaration.title', 'Заявление'),
      description: t('landing.process.declaration.description', 'Заявление о намерениях и обязательствах'),
    },
    {
      number: 3,
      title: t('landing.process.coordination.title', 'Координация'),
      description: t('landing.process.coordination.description', 'Формирование пула и сопоставление'),
    },
    {
      number: 4,
      title: t('landing.process.commitment.title', 'Обязательство'),
      description: t('landing.process.commitment.description', 'Подтверждение участия в пуле'),
    },
    {
      number: 5,
      title: t('landing.process.execution.title', 'Исполнение'),
      description: t('landing.process.execution.description', 'Выполнение обязательств участниками'),
    },
  ];

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

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          SECTION 1: DARK HERO
          ============================================ */}
      <section className="relative min-h-screen bg-[#0A0A0A] text-white">
        <LandingNav variant="dark" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left column: Brand + Statement */}
            <div className="lg:col-span-2">
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

              {/* Large Statement (Italic) */}
              <h1 className="font-landing-heading text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.15] tracking-tight mb-8 italic">
                {t('landing.hero.statement', 'Инфраструктура координации рынка живого скота Казахстана')}
              </h1>

              {/* Substatement */}
              <p className="text-lg lg:text-xl text-white/60 max-w-2xl mb-10">
                {t('landing.hero.substatement', 'Обеспечивающая предсказуемость обязательств и прозрачность операций для всех участников рынка.')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full h-12 px-8 text-base font-medium transition-all hover:-translate-y-0.5 group"
                >
                  {t('landing.hero.cta.primary', 'Понять систему')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate('/auth/login')}
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 rounded-full h-12 px-8 text-base font-medium transition-all"
                >
                  {t('landing.hero.cta.secondary', 'Документация')}
                </Button>
              </div>
            </div>

            {/* Right column: Boundary indicator */}
            <div className="hidden lg:flex items-end justify-end">
              <div className="border border-white/10 p-6 max-w-xs">
                <p className="text-xs tracking-[0.15em] uppercase text-white/40 mb-3">
                  {t('landing.hero.boundaryLabel', 'Важно понимать')}
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {t('landing.hero.boundaryStatement', 'TSP не устанавливает цены, не исполняет сделки и не гарантирует результаты.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-12 bg-white/20" />
        </div>
      </section>

      {/* ============================================
          SECTION 2: WHAT TSP IS (Asymmetric 1:2 grid)
          ============================================ */}
      <section id="about" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-20">
            {/* Left column: Sticky title */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              {/* Section Label */}
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#718096] mb-4">
                {t('landing.systemDefinition.label', 'Определение системы')}
              </p>

              {/* Section Title */}
              <h2 className="font-landing-heading text-4xl font-medium leading-tight tracking-tight text-gray-900">
                {t('landing.systemDefinition.title', 'Что такое TSP')}
              </h2>
            </div>

            {/* Right column: Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-12">
              {/* Large Statement (Italic) */}
              <p className="font-landing-heading text-2xl font-normal italic leading-relaxed text-gray-900">
                {t('landing.systemDefinition.largeStatement', 'TSP — это инфраструктура координации, а не торговая площадка. Система обеспечивает рамки для заявления намерений, формирования обязательств и планирования поставок.')}
              </p>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('landing.systemDefinition.description', 'Участники мясной отрасли Казахстана используют TSP для координации в рамках единых стандартов и правил, сохраняя полную автономию в принятии коммерческих решений.')}
              </p>

              {/* Three Numbered Principles */}
              <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
                {principles.map((principle) => (
                  <PrincipleCard
                    key={principle.number}
                    number={principle.number}
                    title={principle.title}
                    description={principle.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: WHAT TSP DOES NOT DO (ELEVATED - Dark)
          ============================================ */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              {t('landing.boundaries.label', 'Явные ограничения')}
            </p>
            <h2 className="font-landing-heading text-4xl font-medium leading-tight tracking-tight text-white mb-4">
              {t('landing.boundaries.title', 'Чего TSP не делает')}
            </h2>
            <p className="text-lg text-white/50 max-w-2xl">
              {t('landing.boundaries.subtitle', 'Понимание ограничений системы так же важно, как понимание её возможностей.')}
            </p>
          </div>

          {/* 3x2 Boundary Card Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {boundaryCards.map((card, index) => (
              <BoundaryCard
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>

          {/* Footer with antitrust context */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-white/40 max-w-3xl">
              {t('landing.boundaries.footer', 'TSP придерживается принципов рыночной нейтральности и не осуществляет деятельность, которая может рассматриваться как ограничение конкуренции или координация цен.')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 4: HOW IT WORKS (5-step horizontal flow)
          ============================================ */}
      <section className="py-20 lg:py-28 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Centered Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#718096] mb-4">
              {t('landing.process.label', 'Процесс')}
            </p>
            <h2 className="font-landing-heading text-4xl font-medium leading-tight tracking-tight text-gray-900 mb-4">
              {t('landing.process.title', 'Как работает координация')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.process.subtitle', 'Пять этапов участия в системе координации')}
            </p>
          </div>

          {/* 5-Step Horizontal Flow */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-0.5 bg-[#E2E8F0]" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {processSteps.map((step) => (
                <ProcessStep
                  key={step.number}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button
              onClick={() => navigate('/docs')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full h-12 px-8 text-base font-medium transition-all hover:-translate-y-0.5"
            >
              {t('landing.process.cta', 'Подробнее о процессе')}
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: PARTICIPANT PATHWAYS
          ============================================ */}
      <section id="participants" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Asymmetric Header */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#718096] mb-4">
                {t('landing.participants.label', 'Участники')}
              </p>
              <h2 className="font-landing-heading text-4xl font-medium leading-tight tracking-tight text-gray-900">
                {t('landing.participants.title', 'Для кого создана система')}
              </h2>
            </div>
            <div className="flex items-end">
              <p className="text-lg text-gray-600">
                {t('landing.participants.subtitle', 'Добровольное участие в координации рынка')}
              </p>
            </div>
          </div>

          {/* 4 Participant Cards */}
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
          SECTION 6: GOVERNANCE (Dark)
          ============================================ */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
                {t('landing.governance.label', 'Управление')}
              </p>
              <h2 className="font-landing-heading text-4xl font-medium leading-tight tracking-tight text-white mb-6">
                {t('landing.governance.title', 'Управление и поддержка')}
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                {t('landing.governance.description', 'TSP управляется ассоциационной структурой с участием представителей всех сторон рынка. Правила координации разрабатываются при участии отраслевого сообщества.')}
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
                <p className="text-xs tracking-[0.15em] uppercase text-white/40 mb-4">
                  {t('landing.governance.associationLabel', 'Под управлением')}
                </p>
                <p className="text-xl lg:text-2xl text-white font-landing-heading font-medium">
                  {t('landing.governance.association', 'При поддержке отраслевого сообщества')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 7: FOOTER (Dark - 4 columns)
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
                {t('landing.footer.tagline', 'Инфраструктура координации рынка живого скота Казахстана.')}
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">
                {t('landing.footer.resources', 'Ресурсы')}
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
                {t('landing.footer.legal', 'Правовая информация')}
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
