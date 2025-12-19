import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(formData.email, formData.password);
      setIsLoading(false);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: 'Account exists',
            description: 'An account with this email already exists. Please sign in.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registration failed',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Account created',
        description: 'You can now sign in with your credentials.',
      });
      setIsSignUp(false);
      return;
    }

    const { error } = await signIn(formData.email, formData.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      }
      return;
    }

    toast({
      title: 'Welcome back',
      description: 'You have successfully signed in.',
    });
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create your account to access Turan Standard Pool'
              : 'Enter your credentials to access Turan Standard Pool'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </Button>
            </p>
            
            {!isSignUp && (
              <p className="text-sm text-muted-foreground">
                New to the platform?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                  Register as Farmer or MPK
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
