/**
 * MARKET SIGNALS PAGE
 * 
 * Read-only aggregated market demand view for Observer users.
 * Shows indicative, non-binding data only.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { ObserverMarketSignals } from '@/components/farmer/ObserverMarketSignals';
import { PageHeader } from '@/components/ui/PageHeader';

export default function MarketSignals() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Рыночные сигналы"
          description="Индикативные данные о рыночном спросе"
        />
        <ObserverMarketSignals />
      </div>
    </MainLayout>
  );
}
