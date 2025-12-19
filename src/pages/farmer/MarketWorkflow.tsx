import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { MarketWorkflowEducation } from '@/components/farmer/MarketWorkflowEducation';
import { ObserverModeBanner } from '@/components/access';
import { useAccountStatus } from '@/hooks/useAccountStatus';

export default function MarketWorkflow() {
  const { isObserver } = useAccountStatus();

  return (
    <MainLayout>
      <PageHeader 
        title="Как работает рынок Turan Standard Pool" 
        description="Структура участия, этапы работы и требования к поставщикам"
      />

      {isObserver && <ObserverModeBanner className="mb-6" />}

      <MarketWorkflowEducation />
    </MainLayout>
  );
}
