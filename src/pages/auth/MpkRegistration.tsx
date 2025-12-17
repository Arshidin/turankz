import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';

const REGIONS = ['Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar', 'Semey'];
const VOLUME_RANGES = ['Under 100', '100-250', '250-500', '500-1000', '1000+'];
const INTAKE_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  contactPerson: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const step2Schema = z.object({
  intakeRegions: z.array(z.string()).min(1, 'Please select at least one intake region'),
  typicalVolume: z.string().min(1, 'Please select typical monthly volume'),
  ageRangeMin: z.string().optional(),
  ageRangeMax: z.string().optional(),
  weightRangeMin: z.string().optional(),
  weightRangeMax: z.string().optional(),
  intakeMonths: z.array(z.string()).min(1, 'Please select at least one intake month'),
});

export default function MpkRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, assignRole } = useAuthContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Step 1
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    // Step 2
    intakeRegions: [] as string[],
    typicalVolume: '',
    ageRangeMin: '',
    ageRangeMax: '',
    weightRangeMin: '',
    weightRangeMax: '',
    intakeMonths: [] as string[],
  });

  const validateStep1 = () => {
    const result = step1Schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const result = step2Schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      intakeRegions: prev.intakeRegions.includes(region)
        ? prev.intakeRegions.filter(r => r !== region)
        : [...prev.intakeRegions, region]
    }));
  };

  const toggleMonth = (month: string) => {
    setFormData(prev => ({
      ...prev,
      intakeMonths: prev.intakeMonths.includes(month)
        ? prev.intakeMonths.filter(m => m !== month)
        : [...prev.intakeMonths, month]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Create auth account
      const { data: authData, error: authError } = await signUp(formData.email, formData.password);
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          toast({
            title: 'Account exists',
            description: 'An account with this email already exists. Please sign in instead.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registration failed',
            description: authError.message,
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: 'Registration failed',
          description: 'Unable to create account. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Assign mpk role
      const { error: roleError } = await assignRole(authData.user.id, 'mpk');
      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      // Generate mpk_id
      const mpkId = `MPK${Date.now().toString().slice(-6)}`;

      // Parse volume range
      const volumeMap: Record<string, { min: number; max: number }> = {
        'Under 100': { min: 0, max: 100 },
        '100-250': { min: 100, max: 250 },
        '250-500': { min: 250, max: 500 },
        '500-1000': { min: 500, max: 1000 },
        '1000+': { min: 1000, max: 5000 },
      };
      const volume = volumeMap[formData.typicalVolume] || { min: null, max: null };

      // Create MPK profile
      const { error: profileError } = await supabase
        .from('mpks')
        .insert({
          user_id: authData.user.id,
          mpk_id: mpkId,
          name: formData.companyName,
          intake_regions: formData.intakeRegions,
          typical_volume_min: volume.min,
          typical_volume_max: volume.max,
          default_age_range_min: formData.ageRangeMin ? parseInt(formData.ageRangeMin) : null,
          default_age_range_max: formData.ageRangeMax ? parseInt(formData.ageRangeMax) : null,
          default_weight_range_min: formData.weightRangeMin ? parseInt(formData.weightRangeMin) : null,
          default_weight_range_max: formData.weightRangeMax ? parseInt(formData.weightRangeMax) : null,
          common_target_weeks: formData.intakeMonths,
          registration_status: 'pending',
          status: 'inactive',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: 'Profile creation failed',
          description: 'Account created but profile setup failed. Please contact support.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      setStep(4); // Move to pending status screen
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => step === 1 ? navigate('/auth') : setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Step {Math.min(step, 3)} of 3</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && 'Company Details'}
            {step === 2 && 'Intake Profile'}
            {step === 3 && 'Review & Submit'}
            {step === 4 && 'Registration Submitted'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Create your MPK account to join Turan Standard Pool'}
            {step === 2 && 'Define your typical intake parameters'}
            {step === 3 && 'Review the access conditions before submitting'}
            {step === 4 && 'Your application is pending review'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Meat Processing Plant name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  placeholder="Primary contact name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
                {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+7 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button className="w-full" onClick={handleNext}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Intake Regions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map(region => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={formData.intakeRegions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <label htmlFor={region} className="text-sm">{region}</label>
                    </div>
                  ))}
                </div>
                {errors.intakeRegions && <p className="text-sm text-destructive">{errors.intakeRegions}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typicalVolume">Typical Monthly Volume</Label>
                <Select value={formData.typicalVolume} onValueChange={(v) => setFormData({ ...formData, typicalVolume: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select volume range" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOLUME_RANGES.map(v => <SelectItem key={v} value={v}>{v} head/month</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.typicalVolume && <p className="text-sm text-destructive">{errors.typicalVolume}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageRangeMin">Age Range Min (months)</Label>
                  <Input
                    id="ageRangeMin"
                    type="number"
                    placeholder="e.g. 18"
                    value={formData.ageRangeMin}
                    onChange={(e) => setFormData({ ...formData, ageRangeMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRangeMax">Age Range Max (months)</Label>
                  <Input
                    id="ageRangeMax"
                    type="number"
                    placeholder="e.g. 30"
                    value={formData.ageRangeMax}
                    onChange={(e) => setFormData({ ...formData, ageRangeMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weightRangeMin">Weight Range Min (kg)</Label>
                  <Input
                    id="weightRangeMin"
                    type="number"
                    placeholder="e.g. 400"
                    value={formData.weightRangeMin}
                    onChange={(e) => setFormData({ ...formData, weightRangeMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightRangeMax">Weight Range Max (kg)</Label>
                  <Input
                    id="weightRangeMax"
                    type="number"
                    placeholder="e.g. 550"
                    value={formData.weightRangeMax}
                    onChange={(e) => setFormData({ ...formData, weightRangeMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Intake Months</Label>
                <div className="grid grid-cols-3 gap-2">
                  {INTAKE_MONTHS.map(month => (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox
                        id={month}
                        checked={formData.intakeMonths.includes(month)}
                        onCheckedChange={() => toggleMonth(month)}
                      />
                      <label htmlFor={month} className="text-sm">{month.slice(0, 3)}</label>
                    </div>
                  ))}
                </div>
                {errors.intakeMonths && <p className="text-sm text-destructive">{errors.intakeMonths}</p>}
              </div>

              <Button className="w-full" onClick={handleNext}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Purchase Pool Requests are subject to Admin approval.
                  Consistent demand behavior affects access priority.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Company</span>
                  <span>{formData.companyName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Contact</span>
                  <span>{formData.contactPerson}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Intake Regions</span>
                  <span>{formData.intakeRegions.join(', ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Monthly Volume</span>
                  <span>{formData.typicalVolume}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </>
          )}

          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-lg">Inactive — Pending activation</p>
                <p className="text-sm text-muted-foreground">
                  Your registration has been submitted for review.
                  You will have read-only access until Admin approval.
                </p>
              </div>

              <Button className="w-full" onClick={() => navigate('/')}>
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
