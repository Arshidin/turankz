import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-landing-background relative overflow-hidden">
      {/* Subtle abstract geometric element */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
        <div className="absolute top-1/4 right-12 w-px h-48 bg-landing-accent opacity-20" />
        <div className="absolute top-1/3 right-24 w-32 h-px bg-landing-accent opacity-15" />
        <div className="absolute bottom-1/4 right-16 w-px h-32 bg-landing-accent opacity-10" />
      </div>

      {/* Main content - left aligned editorial grid */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="max-w-xl lg:max-w-2xl pt-8">
            {/* Headline */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-landing-foreground leading-[1.1]">
              Turan Standard Pool
            </h1>
            
            {/* Subheadline */}
            <p className="mt-8 md:mt-10 text-lg md:text-xl text-landing-muted font-light leading-relaxed tracking-wide">
              A governed market coordination platform for live cattle supply.
            </p>
            
            {/* Divider */}
            <div className="mt-6 w-12 h-px bg-landing-accent opacity-40" />
            
            {/* Supporting line */}
            <p className="mt-6 text-sm md:text-base text-landing-subtle font-light leading-relaxed">
              Designed to ensure predictability, standards, and year-round supply for the beef industry.
            </p>
            
            {/* Primary action */}
            <div className="mt-14 md:mt-16">
              <Button 
                onClick={() => navigate('/auth/login')}
                variant="ghost"
                className="h-12 px-8 text-sm md:text-base font-normal tracking-wide border border-landing-border text-landing-foreground hover:bg-landing-foreground/5 hover:border-landing-foreground/40 rounded-none transition-colors duration-300"
              >
                Sign in to platform
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
