import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-landing-background relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-[20%] w-px h-full bg-white" />
        <div className="absolute top-0 left-[40%] w-px h-full bg-white" />
        <div className="absolute top-0 left-[60%] w-px h-full bg-white" />
        <div className="absolute top-0 left-[80%] w-px h-full bg-white" />
      </div>

      {/* Main grid layout */}
      <div className="relative z-10 min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 xl:px-24 min-h-screen flex">
          
          {/* Left content column */}
          <div className="flex-1 flex flex-col justify-center py-16 lg:py-24 pr-8 lg:pr-16">
            {/* Headline - McKinsey style italic serif */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-landing-foreground leading-[1.05] italic">
              Turan Standard Pool
            </h1>
            
            {/* Subheadline with arrow */}
            <div className="mt-8 md:mt-10 flex items-start gap-6 max-w-lg">
              <p className="text-base md:text-lg text-landing-muted font-light leading-relaxed">
                A governed market coordination platform for live cattle supply. Designed to ensure predictability, standards, and year-round supply for the beef industry.
              </p>
              <button 
                onClick={() => navigate('/auth/login')}
                className="flex-shrink-0 w-14 h-14 rounded-full border border-landing-border flex items-center justify-center text-landing-foreground hover:bg-landing-card hover:border-landing-accent transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* CTA button */}
            <div className="mt-12 md:mt-16">
              <Button 
                onClick={() => navigate('/auth/login')}
                variant="ghost"
                className="h-12 px-0 text-sm md:text-base font-normal tracking-wide text-landing-foreground hover:bg-transparent hover:text-landing-accent rounded-none transition-colors duration-300 group"
              >
                Sign in to platform
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Right side - McKinsey style cards */}
          <div className="hidden lg:flex flex-1 items-center">
            <div className="w-full grid grid-cols-2 gap-4">
              {/* Featured card - larger */}
              <div className="col-span-2 bg-landing-card hover:bg-landing-card-hover transition-colors duration-300 cursor-default">
                <div className="aspect-[2/1] p-8 flex flex-col justify-between">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-landing-accent font-medium">
                    Market Infrastructure
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-landing-foreground italic leading-tight">
                      Governed supply coordination for agricultural commodities
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-landing-card hover:bg-landing-card-hover transition-colors duration-300 cursor-default">
                <div className="aspect-[4/3] p-6 flex flex-col justify-between">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-landing-subtle font-medium">
                    Standards
                  </span>
                  <div className="space-y-2">
                    <div className="h-px w-full bg-landing-border" />
                    <div className="h-px w-3/4 bg-landing-border/60" />
                    <div className="h-px w-1/2 bg-landing-border/30" />
                  </div>
                </div>
              </div>
              
              {/* Card 3 */}
              <div className="bg-landing-card hover:bg-landing-card-hover transition-colors duration-300 cursor-default">
                <div className="aspect-[4/3] p-6 flex flex-col justify-between">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-landing-subtle font-medium">
                    Predictability
                  </span>
                  <div className="flex items-end justify-between">
                    <span className="text-[9px] tracking-wider uppercase text-landing-subtle/70">2024–2025</span>
                    <div className="w-8 h-px bg-landing-accent/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
