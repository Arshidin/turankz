import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { MatchingWindowManagement } from '@/components/admin/MatchingWindowManagement';

export default function MatchingWindowsManagement() {
  return (
    <MainLayout>
      <PageHeader 
        title="Matching Windows" 
        description="Schedule market coordination windows. Windows define timing rules for batch commitments and matching execution." 
      />
      <MatchingWindowManagement />
    </MainLayout>
  );
}
