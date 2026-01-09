/**
 * FARMER JOURNEY PROGRESS
 *
 * Visual progress indicator showing farmer's journey on the platform.
 * Helps farmers understand what steps they've completed and what's next.
 *
 * Journey Steps:
 * 1. Registration - Account created
 * 2. First Batch - Created first livestock batch
 * 3. Published - Batch published and visible
 * 4. Committed - Made firm commitment
 * 5. Completed - First transaction completed
 */

import { cn } from '@/lib/utils';
import {
  UserCheck,
  Boxes,
  Eye,
  CheckCircle2,
  Truck,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useBatches } from '@/hooks/useBatches';
import { useAuthContext } from '@/contexts/AuthContext';

type JourneyStep = {
  key: string;
  labelKey: string;
  descriptionKey: string;
  icon: typeof UserCheck;
};

const journeySteps: JourneyStep[] = [
  {
    key: 'registered',
    labelKey: 'farmerJourney.steps.registered',
    descriptionKey: 'farmerJourney.steps.registeredDesc',
    icon: UserCheck,
  },
  {
    key: 'first_batch',
    labelKey: 'farmerJourney.steps.firstBatch',
    descriptionKey: 'farmerJourney.steps.firstBatchDesc',
    icon: Boxes,
  },
  {
    key: 'published',
    labelKey: 'farmerJourney.steps.published',
    descriptionKey: 'farmerJourney.steps.publishedDesc',
    icon: Eye,
  },
  {
    key: 'committed',
    labelKey: 'farmerJourney.steps.committed',
    descriptionKey: 'farmerJourney.steps.committedDesc',
    icon: CheckCircle2,
  },
  {
    key: 'completed',
    labelKey: 'farmerJourney.steps.completed',
    descriptionKey: 'farmerJourney.steps.completedDesc',
    icon: Truck,
  },
];

interface FarmerJourneyProgressProps {
  className?: string;
  compact?: boolean;
}

export function FarmerJourneyProgress({ className, compact = false }: FarmerJourneyProgressProps) {
  const { t } = useTranslation();
  const { accountStatus, isObserver } = useAccountStatus();
  const { data: batches = [] } = useBatches();
  const { user } = useAuthContext();

  // Calculate current step based on farmer's actual data
  const calculateCurrentStep = (): number => {
    // Step 1: Registered - always true if user is logged in
    if (!user) return 0;

    const myBatches = batches.filter(b => b.user_id === user.id);

    // Step 2: First Batch - has created at least one batch
    const hasBatch = myBatches.length > 0;
    if (!hasBatch) return 1;

    // Step 3: Published - has at least one published batch (available status)
    const hasPublished = myBatches.some(b =>
      b.status === 'available' || b.status === 'committed' || b.status === 'completed' ||
      // Legacy statuses
      b.status === 'forecast' || b.status === 'soft_committed' ||
      b.status === 'confirmed' || b.status === 'matched' || b.status === 'closed'
    );
    if (!hasPublished) return 2;

    // Step 4: Committed - has at least one committed batch
    const hasCommitted = myBatches.some(b =>
      b.status === 'committed' || b.status === 'completed' ||
      // Legacy statuses
      b.status === 'confirmed' || b.status === 'matched' || b.status === 'closed'
    );
    if (!hasCommitted) return 3;

    // Step 5: Completed - has at least one completed transaction
    const hasCompleted = myBatches.some(b =>
      b.status === 'completed' ||
      // Legacy statuses
      b.status === 'matched' || b.status === 'closed'
    );
    if (!hasCompleted) return 4;

    return 5; // All steps completed
  };

  const currentStep = calculateCurrentStep();

  // Get step status
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  // Compact version - just dots
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {journeySteps.map((_, index) => {
          const status = getStepStatus(index);
          return (
            <div key={index} className="flex items-center">
              <div className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                status === 'completed' && 'bg-emerald-500',
                status === 'current' && 'bg-primary ring-2 ring-primary/30',
                status === 'upcoming' && 'bg-muted border border-border'
              )} />
              {index < journeySteps.length - 1 && (
                <div className={cn(
                  'w-4 h-0.5 mx-0.5',
                  index < currentStep ? 'bg-emerald-500' : 'bg-border'
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full version with labels
  return (
    <div className={cn(
      'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20 p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t('farmerJourney.title', 'Your Journey')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('farmerJourney.subtitle', 'Track your progress on the platform')}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {currentStep}/{journeySteps.length} {t('farmerJourney.stepsLabel', 'steps')}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / journeySteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {journeySteps.map((step, index) => {
          const status = getStepStatus(index);
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={cn(
                'flex flex-col items-center flex-1',
                index < journeySteps.length - 1 && 'relative'
              )}
            >
              {/* Step Circle */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                status === 'completed' && 'bg-emerald-500 text-white',
                status === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                status === 'upcoming' && 'bg-muted border-2 border-border text-muted-foreground'
              )}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Step Label */}
              <span className={cn(
                'text-[10px] mt-1.5 text-center max-w-[60px] leading-tight',
                status === 'current' && 'font-medium text-primary',
                status === 'completed' && 'text-foreground',
                status === 'upcoming' && 'text-muted-foreground'
              )}>
                {t(step.labelKey, step.key)}
              </span>

              {/* Current Step Badge */}
              {status === 'current' && (
                <Badge
                  variant="outline"
                  className="absolute -bottom-5 text-[8px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30"
                >
                  {t('farmerJourney.current', 'Current')}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Action Hint */}
      {currentStep < journeySteps.length && (
        <div className="mt-6 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ChevronRight className="w-3 h-3 text-primary" />
            <span>
              {t('farmerJourney.nextStep', 'Next')}: {' '}
              <span className="text-foreground font-medium">
                {t(journeySteps[currentStep]?.descriptionKey || '', '')}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
