import { useTranslation } from 'react-i18next';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Home, Headphones } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';

export default function MembershipSuccess() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const { applicationNumber, createdAt } = (location.state as {
    applicationNumber?: string;
    createdAt?: string;
  }) || {};

  // Redirect if no application data
  if (!applicationNumber) {
    return <Navigate to="/join" replace />;
  }

  const getLocale = () => {
    switch (i18n.language) {
      case 'ru':
        return ru;
      case 'kk':
        return kk;
      default:
        return enUS;
    }
  };

  const formattedDate = createdAt
    ? format(new Date(createdAt), 'd MMMM yyyy', { locale: getLocale() })
    : format(new Date(), 'd MMMM yyyy', { locale: getLocale() });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          <Link to="/welcome" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--text-primary)]">
              TURAN
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-[var(--color-success)]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            {t('membership.success.title')}
          </h1>

          {/* Message */}
          <p className="text-[var(--text-secondary)] mb-8">
            {t('membership.success.message')}
          </p>

          {/* Application Details Card */}
          <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] mb-8">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">
                  {t('membership.success.application_number')}
                </span>
                <span className="font-mono font-medium text-[var(--text-primary)]">
                  {applicationNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">
                  {t('membership.success.submission_date')}
                </span>
                <span className="text-[var(--text-primary)]">
                  {formattedDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">
                  {t('membership.success.status')}
                </span>
                <span className="text-[var(--color-warning)] font-medium">
                  {t('membership.success.status_pending')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="text-left mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              {t('membership.success.next_steps.title')}
            </h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <span className="text-[var(--text-secondary)]">
                  {t('membership.success.next_steps.step1')}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <span className="text-[var(--text-secondary)]">
                  {t('membership.success.next_steps.step2')}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <span className="text-[var(--text-secondary)]">
                  {t('membership.success.next_steps.step3')}
                </span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/welcome">
                <Home className="mr-2 h-4 w-4" />
                {t('membership.success.back_home')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@turan.kz">
                <Headphones className="mr-2 h-4 w-4" />
                {t('membership.success.contact_support')}
              </a>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto text-center text-sm text-[var(--text-tertiary)]">
          <p>© {new Date().getFullYear()} TURAN. {t('common.all_rights_reserved')}</p>
        </div>
      </footer>
    </div>
  );
}
