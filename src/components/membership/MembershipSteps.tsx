import { useTranslation } from 'react-i18next';
import { FileText, Search, FileSignature, PartyPopper } from 'lucide-react';

const steps = [
  { key: 'step1', icon: FileText },
  { key: 'step2', icon: Search },
  { key: 'step3', icon: FileSignature },
  { key: 'step4', icon: PartyPopper },
] as const;

export function MembershipSteps() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 bg-[var(--bg-surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
          {t('membership.steps.title')}
        </h2>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--border-subtle)] hidden md:block" />

          <div className="space-y-8">
            {steps.map(({ key, icon: Icon }, index) => (
              <div key={key} className="relative flex gap-6">
                {/* Step number */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="text-sm text-[var(--accent-primary)] font-medium mb-1">
                    {t('membership.steps.step_label', { number: index + 1 })}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {t(`membership.steps.${key}.title`)}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {t(`membership.steps.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
