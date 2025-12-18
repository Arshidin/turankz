import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { MatchingWindowManagement } from '@/components/admin/MatchingWindowManagement';

export default function MatchingWindowsManagement() {
  return (
    <MainLayout>
      <PageHeader 
        title="Matching Windows" 
        description="Manage time-based market coordination windows. Only one window can be active at a time." 
      />
      <MatchingWindowManagement />
    </MainLayout>
  );
}
