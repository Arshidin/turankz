import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface MembershipCTAProps {
  onApplyClick: () => void;
}

export function MembershipCTA({ onApplyClick }: MembershipCTAProps) {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 bg-[var(--bg-surface)]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          {t('membership.final_cta.title')}
        </h2>

        <p className="text-lg text-[var(--text-secondary)] mb-8">
          {t('membership.final_cta.subtitle')}
        </p>

        <Button
          size="lg"
          onClick={onApplyClick}
          className="text-base px-10 py-6 text-lg"
        >
          {t('membership.final_cta.button')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
