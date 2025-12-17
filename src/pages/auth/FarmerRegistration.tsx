import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';

const REGIONS = ['Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar', 'Semey'];
const DISTRICTS = ['Central', 'North', 'South', 'East', 'West'];
const FARM_TYPES = ['Cattle Ranch', 'Mixed Farm', 'Feedlot', 'Dairy with Beef'];
const HERD_SIZES = ['Under 50', '50-100', '100-250', '250-500', '500+'];
const CATTLE_TYPES = ['Beef Cattle', 'Mixed Purpose', 'Dairy Crossbred'];

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  region: z.string().min(1, 'Please select a region'),
});

const step2Schema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters').max(100),
  district: z.string().min(1, 'Please select a district'),
  farmType: z.string().min(1, 'Please select a farm type'),
  herdSize: z.string().min(1, 'Please select estimated herd size'),
  cattleType: z.string().min(1, 'Please select primary cattle type'),
});

export default function FarmerRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, assignRole } = useAuthContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    phone: '',
    password: '',
    region: '',
    // Step 2
    farmName: '',
    district: '',
    farmType: '',
    herdSize: '',
    cattleType: '',
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

      // Assign farmer role
      const { error: roleError } = await assignRole(authData.user.id, 'farmer');
      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      // Generate farmer_id
      const farmerId = `F${Date.now().toString().slice(-6)}`;

      // Create farmer profile
      const { error: profileError } = await supabase
        .from('farmers')
        .insert({
          user_id: authData.user.id,
          farmer_id: farmerId,
          name: formData.farmName || formData.name,
          contact_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          district: formData.district,
          farm_type: formData.farmType,
          registration_status: 'pending',
          grading: 'observer',
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
            {step === 1 && 'Account Details'}
            {step === 2 && 'Farm Profile'}
            {step === 3 && 'Review & Submit'}
            {step === 4 && 'Registration Submitted'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Create your account to join Turan Standard Pool'}
            {step === 2 && 'Tell us about your farming operation'}
            {step === 3 && 'Review the access conditions before submitting'}
            {step === 4 && 'Your application is pending review'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
              </div>

              <Button className="w-full" onClick={handleNext}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm / Farmer Name</Label>
                <Input
                  id="farmName"
                  placeholder="Name as registered"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                />
                {errors.farmName && <p className="text-sm text-destructive">{errors.farmName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmType">Farm Type</Label>
                <Select value={formData.farmType} onValueChange={(v) => setFormData({ ...formData, farmType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FARM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.farmType && <p className="text-sm text-destructive">{errors.farmType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="herdSize">Estimated Herd Size</Label>
                <Select value={formData.herdSize} onValueChange={(v) => setFormData({ ...formData, herdSize: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select herd size range" />
                  </SelectTrigger>
                  <SelectContent>
                    {HERD_SIZES.map(s => <SelectItem key={s} value={s}>{s} head</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.herdSize && <p className="text-sm text-destructive">{errors.herdSize}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cattleType">Primary Cattle Type</Label>
                <Select value={formData.cattleType} onValueChange={(v) => setFormData({ ...formData, cattleType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cattle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATTLE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.cattleType && <p className="text-sm text-destructive">{errors.cattleType}</p>}
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
                  Registration does not guarantee participation in purchase pools.
                  Access depends on declared batches and compliance with standards.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Name</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Region</span>
                  <span>{formData.region}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Farm Name</span>
                  <span>{formData.farmName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Farm Type</span>
                  <span>{formData.farmType}</span>
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
                <p className="font-medium text-lg">Observer — Pending activation</p>
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
