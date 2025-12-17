import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

export default function FarmerProfile() {
  return (
    <MainLayout>
      <PageHeader 
        title="My Profile" 
        description="Manage your farm information and registration details" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Farm Information</CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Farm Name</p>
                  <p className="text-sm font-medium text-foreground">Alash Agro Farm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration ID</p>
                  <p className="text-sm font-medium text-foreground">FRM-2024-0892</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="text-sm font-medium text-foreground">Almaty Oblast</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="text-sm font-medium text-foreground">Enbekshikazakh</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="text-sm font-medium text-foreground">Aibek Nurlanovich</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">+7 (777) 123-4567</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Livestock Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">450</p>
                  <p className="text-sm text-muted-foreground">Total Heads</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">120</p>
                  <p className="text-sm text-muted-foreground">Available for Sale</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">85%</p>
                  <p className="text-sm text-muted-foreground">Grading Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Farm Registration</span>
                <Badge variant="secondary" className="bg-status-confirmed-bg text-status-confirmed border-0">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Veterinary License</span>
                <Badge variant="secondary" className="bg-status-confirmed-bg text-status-confirmed border-0">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bank Details</span>
                <Badge variant="secondary" className="bg-status-soft-committed-bg text-status-soft-committed border-0">Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Pool Eligibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-status-confirmed-bg rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-semibold text-status-confirmed">A</span>
                </div>
                <p className="text-sm font-medium text-foreground">Grade A Eligible</p>
                <p className="text-xs text-muted-foreground mt-1">Qualified for premium pool</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
