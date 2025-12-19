import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-landing-background relative overflow-hidden">
      {/* Right-side architectural grid elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
        {/* Primary vertical line */}
        <div className="absolute top-0 right-[20%] w-px h-full bg-landing-accent opacity-[0.06]" />
        {/* Secondary vertical line */}
        <div className="absolute top-0 right-[40%] w-px h-full bg-landing-accent opacity-[0.03]" />
        {/* Horizontal accent */}
        <div className="absolute top-1/3 right-12 w-24 h-px bg-landing-accent opacity-[0.08]" />
        {/* Corner detail */}
        <div className="absolute bottom-24 right-[20%] w-px h-16 bg-landing-accent opacity-[0.05]" />
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
            <p className="mt-10 md:mt-12 text-lg md:text-xl text-landing-muted font-light leading-relaxed tracking-wide">
              A governed market coordination platform for live cattle supply.
            </p>
            
            {/* Editorial divider */}
            <div className="mt-8 w-16 h-px bg-landing-accent opacity-30" />
            
            {/* Supporting line */}
            <p className="mt-8 text-sm md:text-base text-landing-subtle font-light leading-relaxed">
              Designed to ensure predictability, standards, and year-round supply for the beef industry.
            </p>
            
            {/* Primary action */}
            <div className="mt-16 md:mt-20">
              <Button 
                onClick={() => navigate('/auth/login')}
                variant="ghost"
                className="h-14 px-10 text-sm md:text-base font-normal tracking-wide border border-landing-border text-landing-foreground hover:bg-landing-foreground/[0.03] hover:border-landing-accent/50 rounded-none transition-all duration-500"
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
