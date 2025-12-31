/**
 * BATCH ONBOARDING COMPONENT
 * 
 * Interactive step-by-step tutorial for farmers creating their first batch.
 * Explains the batch lifecycle, statuses, and guides through the process.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  FileEdit,
  Eye,
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Info,
  PlayCircle,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { BatchStatusExplanation } from './BatchStatusExplanation';
import {
  BATCH_STATUS_LABELS_RU,
  BATCH_STATUS_DESCRIPTIONS_RU,
  type BatchLifecycleStatus,
} from '@/lib/batch-lifecycle';

interface BatchOnboardingProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function BatchOnboarding({ onComplete, onDismiss }: BatchOnboardingProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDismissed, setIsDismissed] = useState(false);
  const totalSteps = 4;

  // Check if onboarding was dismissed in localStorage
  const onboardingDismissedKey = 'batch_onboarding_dismissed';
  const wasDismissed = typeof window !== 'undefined' 
    ? localStorage.getItem(onboardingDismissedKey) === 'true'
    : false;

  // Don't show if dismissed
  if (wasDismissed || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(onboardingDismissedKey, 'true');
    }
    onDismiss?.();
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(onboardingDismissedKey, 'true');
    }
    onComplete?.();
    navigate('/farmer/batches');
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Step content
  const steps = {
    1: {
      title: t('batchOnboarding.step1.title'),
      description: t('batchOnboarding.step1.description'),
      icon: PlayCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              {t('batchOnboarding.step1.whatIsBatch')}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t('batchOnboarding.step1.batchDescription')}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {t('batchOnboarding.step1.step1Title')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('batchOnboarding.step1.step1Desc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {t('batchOnboarding.step1.step2Title')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('batchOnboarding.step1.step2Desc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {t('batchOnboarding.step1.step3Title')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('batchOnboarding.step1.step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    2: {
      title: t('batchOnboarding.step2.title'),
      description: t('batchOnboarding.step2.description'),
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <BatchStatusExplanation />
        </div>
      ),
    },
    3: {
      title: t('batchOnboarding.step3.title'),
      description: t('batchOnboarding.step3.description'),
      icon: Lightbulb,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileEdit className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">
                  {t('batchOnboarding.step3.step1Title')}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('batchOnboarding.step3.step1Desc')}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>{t('batchOnboarding.step3.step1Item1')}</li>
                  <li>{t('batchOnboarding.step3.step1Item2')}</li>
                  <li>{t('batchOnboarding.step3.step1Item3')}</li>
                  <li>{t('batchOnboarding.step3.step1Item4')}</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="h-3 w-3 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">
                  {t('batchOnboarding.step3.step2Title')}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('batchOnboarding.step3.step2Desc')}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>{t('batchOnboarding.step3.step2Item1')}</li>
                  <li>{t('batchOnboarding.step3.step2Item2')}</li>
                  <li>{t('batchOnboarding.step3.step2Item3')}</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="h-3 w-3 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">
                  {t('batchOnboarding.step3.step3Title')}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('batchOnboarding.step3.step3Desc')}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>{t('batchOnboarding.step3.step3Item1')}</li>
                  <li>{t('batchOnboarding.step3.step3Item2')}</li>
                  <li>{t('batchOnboarding.step3.step3Item3')}</li>
                  <li>{t('batchOnboarding.step3.step3Item4')}</li>
                </ul>
              </div>
            </div>
          </div>

          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              {t('batchOnboarding.step3.tip')}
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    4: {
      title: t('batchOnboarding.step4.title'),
      description: t('batchOnboarding.step4.description'),
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {t('batchOnboarding.step4.ready')}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t('batchOnboarding.step4.readyDesc')}
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                {t('batchOnboarding.step4.whatsNext')}
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>{t('batchOnboarding.step4.next1')}</li>
                <li>{t('batchOnboarding.step4.next2')}</li>
                <li>{t('batchOnboarding.step4.next3')}</li>
                <li>{t('batchOnboarding.step4.next4')}</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  };

  const currentStepData = steps[currentStep as keyof typeof steps];
  const StepIcon = currentStepData.icon;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {currentStepData.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('batchOnboarding.step')} {currentStep} {t('common.of', 'of')} {totalSteps}
            </span>
            <span className="text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step Content */}
        <div className="min-h-[200px]">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('batchOnboarding.back')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              {t('batchOnboarding.skip')}
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                {t('batchOnboarding.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                <Package className="h-4 w-4 mr-2" />
                {t('batchOnboarding.createFirst')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

