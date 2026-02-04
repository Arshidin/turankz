import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  MembershipHero,
  MembershipBenefits,
  MembershipSteps,
  MembershipFAQ,
  MembershipCTA,
  MembershipApplicationDialog,
} from '@/components/membership';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function MembershipLanding() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const benefitsRef = useRef<HTMLDivElement>(null);

  const handleApplyClick = () => {
    setDialogOpen(true);
  };

  const handleLearnMoreClick = () => {
    benefitsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-base)]/80 backdrop-blur-sm border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--text-primary)]">
              TURAN
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/auth/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t('common.login')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <MembershipHero
          onApplyClick={handleApplyClick}
          onLearnMoreClick={handleLearnMoreClick}
        />

        <div ref={benefitsRef}>
          <MembershipBenefits />
        </div>

        <MembershipSteps />

        <MembershipFAQ />

        <MembershipCTA onApplyClick={handleApplyClick} />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto text-center text-sm text-[var(--text-tertiary)]">
          <p>© {new Date().getFullYear()} TURAN. {t('common.all_rights_reserved')}</p>
        </div>
      </footer>

      {/* Application Dialog */}
      <MembershipApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
