import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-landing-background relative overflow-hidden">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical grid lines */}
        <div className="absolute top-0 left-[25%] w-px h-full bg-landing-accent opacity-[0.03]" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-landing-accent opacity-[0.04]" />
        <div className="absolute top-0 left-[75%] w-px h-full bg-landing-accent opacity-[0.03]" />
        {/* Horizontal grid lines */}
        <div className="absolute top-[33%] left-0 w-full h-px bg-landing-accent opacity-[0.02]" />
        <div className="absolute top-[66%] left-0 w-full h-px bg-landing-accent opacity-[0.02]" />
      </div>

      {/* Right-side institutional insight panels */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none hidden lg:block">
        {/* Panel 1 - Primary insight tile */}
        <div className="absolute top-[18%] right-[12%] w-72 border border-landing-border/40 bg-landing-background/50">
          <div className="p-6">
            <span className="text-[10px] tracking-[0.2em] uppercase text-landing-subtle/70 font-light">
              Market Infrastructure
            </span>
            <div className="mt-4 space-y-2">
              <div className="h-px w-full bg-landing-accent/20" />
              <div className="h-px w-3/4 bg-landing-accent/15" />
              <div className="h-px w-1/2 bg-landing-accent/10" />
            </div>
            <div className="mt-6 flex justify-between items-end">
              <span className="text-[9px] tracking-wider uppercase text-landing-subtle/50">Q4 2024</span>
              <div className="w-8 h-px bg-landing-accent/30" />
            </div>
          </div>
        </div>

        {/* Panel 2 - Secondary tile (offset, slightly overlapping) */}
        <div className="absolute top-[42%] right-[22%] w-56 border border-landing-border/30 bg-landing-background/30">
          <div className="p-5">
            <span className="text-[9px] tracking-[0.2em] uppercase text-landing-subtle/60 font-light">
              Supply Governance
            </span>
            <div className="mt-3 space-y-1.5">
              <div className="h-px w-full bg-landing-accent/15" />
              <div className="h-px w-2/3 bg-landing-accent/10" />
            </div>
          </div>
        </div>

        {/* Panel 3 - Tertiary accent tile */}
        <div className="absolute top-[62%] right-[8%] w-48 border border-landing-border/20 bg-landing-background/20">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[8px] tracking-[0.15em] uppercase text-landing-subtle/50 font-light">
                Standards
              </span>
              <div className="w-6 h-px bg-landing-accent/20" />
            </div>
            <div className="mt-3">
              <div className="h-px w-full bg-landing-accent/10" />
            </div>
          </div>
        </div>

        {/* Connecting architectural lines */}
        <div className="absolute top-[35%] right-[35%] w-px h-20 bg-landing-accent/10" />
        <div className="absolute top-[58%] right-[18%] w-12 h-px bg-landing-accent/8" />
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
