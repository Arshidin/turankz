import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  TrendingUp,
  Truck,
  Users,
  Calculator,
  Headphones,
} from 'lucide-react';

const benefits = [
  { key: 'guaranteed_prices', icon: Shield },
  { key: 'premiums', icon: TrendingUp },
  { key: 'logistics', icon: Truck },
  { key: 'community', icon: Users },
  { key: 'transparent', icon: Calculator },
  { key: 'support', icon: Headphones },
] as const;

export function MembershipBenefits() {
  const { t } = useTranslation();

  return (
    <section id="benefits" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
          {t('membership.benefits.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ key, icon: Icon }) => (
            <Card
              key={key}
              className="bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-primary-muted)] flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {t(`membership.benefits.${key}.title`)}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  {t(`membership.benefits.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
