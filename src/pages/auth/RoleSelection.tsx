import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wheat, Factory } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Join Turan Standard Pool</h1>
          <p className="text-muted-foreground">
            A governed platform for coordinated livestock supply between farmers and meat processing plants.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => navigate('/auth/register/farmer')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Wheat className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Register as Farmer</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm">
                Declare livestock batches and participate in purchase pools.
                Access depends on batch declarations and compliance with standards.
              </CardDescription>
              <Button className="mt-4 w-full" variant="outline">
                Continue as Farmer
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => navigate('/auth/register/mpk')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Register as MPK</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm">
                Create purchase pool requests and coordinate livestock procurement.
                Consistent demand behavior affects access priority.
              </CardDescription>
              <Button className="mt-4 w-full" variant="outline">
                Continue as MPK
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth/login')}>
              Sign in
            </Button>
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <p>
            Turan Standard Pool is a pilot program. Registration does not guarantee participation.
            All access is subject to Admin review and platform governance.
          </p>
        </div>
      </div>
    </div>
  );
}
