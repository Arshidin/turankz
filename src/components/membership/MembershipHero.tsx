import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface MembershipHeroProps {
  onApplyClick: () => void;
  onLearnMoreClick: () => void;
}

export function MembershipHero({ onApplyClick, onLearnMoreClick }: MembershipHeroProps) {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary-muted)] to-transparent opacity-30" />

      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
          {t('membership.hero.title')}
        </h1>

        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
          {t('membership.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={onApplyClick}
            className="text-base px-8"
          >
            {t('membership.hero.cta_primary')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onLearnMoreClick}
            className="text-base px-8"
          >
            {t('membership.hero.cta_secondary')}
            <ChevronDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
