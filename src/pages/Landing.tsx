import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="max-w-2xl">
          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-neutral-900 leading-tight">
            Turan Standard Pool
          </h1>
          
          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl text-neutral-600 font-light leading-relaxed">
            A governed market coordination platform for live cattle supply.
          </p>
          
          {/* Supporting line */}
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-light leading-relaxed">
            Designed to ensure predictability, standards, and year-round supply for the beef industry.
          </p>
          
          {/* Primary action */}
          <div className="mt-12">
            <Button 
              onClick={() => navigate('/auth/login')}
              variant="outline"
              className="h-12 px-8 text-base font-normal border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white rounded-none transition-colors duration-200"
            >
              Sign in to platform
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
