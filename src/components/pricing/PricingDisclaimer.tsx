import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

interface PricingDisclaimerProps {
  variant?: 'card' | 'alert' | 'inline';
  compact?: boolean;
}

/**
 * Standard disclaimer for all pricing displays.
 * Ensures consistent messaging about reference-based, market-driven pricing.
 */
export function PricingDisclaimer({ variant = 'card', compact = false }: PricingDisclaimerProps) {
  const disclaimerText = compact ? (
    <>
      Reference prices are indicative market benchmarks. Final settlement prices are determined at delivery based on market conditions.
    </>
  ) : (
    <>
      Reference prices are indicative market benchmarks. Final settlement prices are determined at delivery based on market conditions. TURAN does not set, enforce, or guarantee transaction prices. Participation is voluntary.
    </>
  );

  if (variant === 'inline') {
    return (
      <p className="text-xs text-muted-foreground italic">
        {disclaimerText}
      </p>
    );
  }

  if (variant === 'alert') {
    return (
      <Alert className="border-muted bg-muted/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          {disclaimerText}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            {disclaimerText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Premium terminology description for compliance.
 * Frames premiums as incentive-based, not penalties or price controls.
 */
export function PremiumTerminologyNote({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Incentive-based premiums earned for compliance with standards, predictability, and discipline.
      </p>
    );
  }

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/5">
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Premiums are <span className="font-medium text-foreground">incentive-based rewards</span> earned for compliance with standards, predictability, and discipline. They are not penalties, discounts, or price controls.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
