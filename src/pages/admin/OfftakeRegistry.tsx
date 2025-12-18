import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { OfftakeRegistry as OfftakeRegistryComponent } from '@/components/admin/OfftakeRegistry';

export default function OfftakeRegistryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Offtake Registry"
          description="Finalized matchings aggregated into executable offtake agreements"
        />
        <OfftakeRegistryComponent />
      </div>
    </MainLayout>
  );
}
