import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  Save, 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  FileText,
  AlertTriangle,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useBatchStats } from '@/hooks/useBatches';
import { useFarmers, useUpdateFarmerProfile, type FarmerGrading } from '@/hooks/useFarmers';

const GRADING_CONFIG: Record<FarmerGrading, { 
  label: string; 
  description: string; 
  access: string;
  color: string;
}> = {
  observer: {
    label: 'Observer',
    description: 'You can view market activity and declare batches, but are not yet eligible for pool matching.',
    access: 'Not eligible for pools',
    color: 'text-muted-foreground',
  },
  declared_supplier: {
    label: 'Declared Supplier',
    description: 'You have declared batches and may receive pool invitations based on availability.',
    access: 'Eligible for pool invitations',
    color: 'text-amber-600',
  },
  standard_supplier: {
    label: 'Standard Supplier',
    description: 'You have a track record of confirmed deliveries and receive priority in pool matching.',
    access: 'Priority pool access',
    color: 'text-emerald-600',
  },
};

const REGIONS = [
  'Almaty',
  'Astana',
  'Shymkent',
  'Aktobe',
  'Karaganda',
  'Pavlodar',
  'Kostanay',
  'East Kazakhstan',
  'West Kazakhstan',
  'North Kazakhstan',
];

const FARM_TYPES = [
  'Cattle Ranch',
  'Mixed Livestock',
  'Feedlot Operation',
  'Breeding Farm',
  'Other',
];

const formSchema = z.object({
  name: z.string().min(2, 'Farm name is required').max(100),
  contact_name: z.string().min(2, 'Contact name is required').max(100),
  region: z.string().min(1, 'Region is required'),
  district: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().min(5, 'Phone number is required').max(20),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  farm_type: z.string().min(1, 'Farm type is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function FarmerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  
  // For demo, we'll use the first farmer from the list
  // In production, this would use the authenticated user's farmer record
  const { data: farmers, isLoading: farmersLoading, error: farmersError } = useFarmers();
  const farmer = farmers?.[0] || null;
  
  const updateProfile = useUpdateFarmerProfile();
  const stats = useBatchStats();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      region: '',
      district: '',
      phone: '',
      email: '',
      farm_type: 'Cattle Ranch',
    },
  });

  // Update form when farmer data loads
  useEffect(() => {
    if (farmer) {
      form.reset({
        name: farmer.name || '',
        contact_name: farmer.contact_name || farmer.name || '',
        region: farmer.region || '',
        district: farmer.district || '',
        phone: farmer.phone || '',
        email: farmer.email || '',
        farm_type: farmer.farm_type || 'Cattle Ranch',
      });
    }
  }, [farmer, form]);

  const handleSave = async (data: FormData) => {
    if (!farmer) return;
    
    await updateProfile.mutateAsync({
      id: farmer.id,
      name: data.name,
      contact_name: data.contact_name,
      region: data.region,
      district: data.district || undefined,
      phone: data.phone,
      email: data.email || undefined,
      farm_type: data.farm_type,
    });
    
    setIsEditing(false);
  };

  const gradingLevels: FarmerGrading[] = ['observer', 'declared_supplier', 'standard_supplier'];
  const currentGrading = farmer?.grading || 'observer';
  const currentIndex = gradingLevels.indexOf(currentGrading);

  const getNextAction = (): string => {
    switch (currentGrading) {
      case 'observer':
        return 'Declare your first batch to become a Declared Supplier.';
      case 'declared_supplier':
        return 'Confirm batch deliveries to progress to Standard Supplier.';
      case 'standard_supplier':
        return 'Maintain consistent confirmations to retain priority status.';
      default:
        return '';
    }
  };

  if (farmersLoading) {
    return (
      <MainLayout>
        <PageHeader title="Profile & Status" description="Loading..." />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (farmersError || !farmer) {
    return (
      <MainLayout>
        <PageHeader title="Profile & Status" description="Manage your farm information" />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No farmer profile found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please contact an administrator to set up your profile.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Profile & Status" 
        description="Manage your farm information and track your participation status" 
      />

      {/* Farmer Status & Progress Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Your Status in Turan Standard Pool</CardTitle>
            <Badge variant="outline">{farmer.farmer_id}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Grading */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-semibold ${GRADING_CONFIG[currentGrading].color}`}>
                  {GRADING_CONFIG[currentGrading].label}
                </span>
                <Badge variant="outline" className={GRADING_CONFIG[currentGrading].color}>
                  {GRADING_CONFIG[currentGrading].access}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {GRADING_CONFIG[currentGrading].description}
              </p>
            </div>
            {farmer.is_restricted && (
              <Badge variant="destructive">Restricted</Badge>
            )}
          </div>

          {/* Progression Indicator */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3">Progression Path</p>
            <div className="flex items-center gap-2 flex-wrap">
              {gradingLevels.map((level, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = level === currentGrading;
                
                return (
                  <div key={level} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      isCurrent 
                        ? 'border-primary bg-primary/5' 
                        : isActive 
                          ? 'border-emerald-500/30 bg-emerald-500/5' 
                          : 'border-border bg-muted/30'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isActive && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-sm ${isCurrent ? 'font-medium' : isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {GRADING_CONFIG[level].label}
                      </span>
                    </div>
                    {index < gradingLevels.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* What to do next */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">What to do next</p>
                <p className="text-sm text-muted-foreground mt-1">{getNextAction()}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Batches</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xl font-semibold">{stats.forecast}</p>
              <p className="text-xs text-muted-foreground">Forecast</p>
            </div>
            <div className="text-center p-3 bg-amber-500/10 rounded-lg">
              <p className="text-xl font-semibold text-amber-600">{stats.softCommitted}</p>
              <p className="text-xs text-muted-foreground">Soft Committed</p>
            </div>
            <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
              <p className="text-xl font-semibold text-emerald-600">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-semibold text-emerald-600">{farmer.total_confirmations}</p>
              <p className="text-xs text-muted-foreground">Confirmations</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive">{farmer.total_declines}</p>
              <p className="text-xs text-muted-foreground">Declines</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-amber-600">{farmer.missed_updates}</p>
              <p className="text-xs text-muted-foreground">Missed Updates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Farm Profile</CardTitle>
              <CardDescription>Your registered farm information</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="Optional" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="farm_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FARM_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        form.reset();
                        setIsEditing(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Farm Name</p>
                    <p className="text-sm font-medium">{farmer.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                    <p className="text-sm font-medium">{farmer.contact_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p className="text-sm font-medium">{farmer.phone || '—'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Region</p>
                    <p className="text-sm font-medium">{farmer.region}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">District</p>
                    <p className="text-sm font-medium">{farmer.district || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Farm Type</p>
                    <p className="text-sm font-medium">{farmer.farm_type || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participation Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">How Participation Works</CardTitle>
            <CardDescription>Understanding the pool system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Declaring Batches</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• Register livestock you expect to sell</li>
                <li>• Specify region, quantity, and target week</li>
                <li>• Forecasts indicate early availability signals</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-medium">Soft Commitment</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• Indicates intent to deliver</li>
                <li>• Makes batch visible for pool matching</li>
                <li>• Can still be adjusted before confirmation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium">Confirmation</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• Commits batch for the target week</li>
                <li>• Receives priority in pool matching</li>
                <li>• Builds your supplier track record</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  Consistent confirmation behavior improves your grading level and pool access priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
