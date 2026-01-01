import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';
import { Boxes, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, Shield, Info } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { SystemHealthSummary } from '@/components/admin/SystemHealthSummary';
import { SupplyDemandSnapshot } from '@/components/admin/SupplyDemandSnapshot';
import { AttentionRequired } from '@/components/admin/AttentionRequired';
import { CurrentMatchingWindowBanner } from '@/components/admin/CurrentMatchingWindowBanner';
import { ReliabilityPremiumCard } from '@/components/premium';
import { ObserverDashboard } from '@/components/farmer/ObserverDashboard';
import { ObserverMpkDashboard } from '@/components/mpk/ObserverMpkDashboard';
import { AggregatedDemandCard } from '@/components/farmer/AggregatedDemandCard';
import { RelevantMarketSignals } from '@/components/farmer/RelevantMarketSignals';
import { MarketCalendar } from '@/components/shared/MarketCalendar';
import { BatchOnboarding } from '@/components/farmer/BatchOnboarding';
import { FirstActionPrompt } from '@/components/auth/FirstActionPrompt';
import { useFarmers } from '@/hooks/useFarmers';
import { useMpks } from '@/hooks/useMpks';
import { useBatches } from '@/hooks/useBatches';
import { usePoolRequests } from '@/hooks/usePoolRequests';
import { useCurrentFarmer, useIsObserver } from '@/hooks/useCurrentFarmer';
import { useCurrentMpk } from '@/hooks/useCurrentMpk';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useMemo } from 'react';

const getGradingConfig = (grading: string | null | undefined) => {
  switch (grading) {
    case 'observer':
      return {
        gradingLevel: 'Наблюдатель',
        gradingDescription: 'Ваша заявка находится на рассмотрении. Вы имеете доступ только для просмотра.',
        accessLevel: 'Только просмотр',
        nextAction: 'Ожидайте активации от Администратора.',
        gradingLevels: [
          { name: 'Наблюдатель', active: true },
          { name: 'Объявленный поставщик', active: false },
          { name: 'Стандартный поставщик', active: false },
        ],
      };
    case 'declared_supplier':
      return {
        gradingLevel: 'Объявленный поставщик',
        gradingDescription: 'Ваше хозяйство верифицировано и вы можете участвовать в пуле сопоставления.',
        accessLevel: 'Доступны приглашения в пул',
        nextAction: 'Подтвердите хотя бы одну партию для повышения приоритета.',
        gradingLevels: [
          { name: 'Наблюдатель', active: false },
          { name: 'Объявленный поставщик', active: true },
          { name: 'Стандартный поставщик', active: false },
        ],
      };
    case 'standard_supplier':
      return {
        gradingLevel: 'Стандартный поставщик',
        gradingDescription: 'Вы достигли высшего уровня надёжности и получаете приоритет при сопоставлении.',
        accessLevel: 'Полный доступ + приоритет',
        nextAction: 'Поддерживайте качество поставок для сохранения статуса.',
        gradingLevels: [
          { name: 'Наблюдатель', active: false },
          { name: 'Объявленный поставщик', active: false },
          { name: 'Стандартный поставщик', active: true },
        ],
      };
    default:
      return {
        gradingLevel: 'Наблюдатель',
        gradingDescription: 'Ваша заявка находится на рассмотрении.',
        accessLevel: 'Только просмотр',
        nextAction: 'Ожидайте активации.',
        gradingLevels: [
          { name: 'Наблюдатель', active: true },
          { name: 'Объявленный поставщик', active: false },
          { name: 'Стандартный поставщик', active: false },
        ],
      };
  }
};

// Helper to format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Только что';
  if (diffHours < 24) return `${diffHours}ч назад`;
  if (diffDays === 1) return '1 день назад';
  return `${diffDays} дн. назад`;
};

// Parse target_week to get month key for grouping
// Supports formats: YYYY-WXX (e.g., 2025-W01) and WXX-YYYY (e.g., W01-2025)
function getMonthKeyFromTargetWeek(targetWeek: string | null | undefined): string {
  if (!targetWeek) return 'Unknown';
  
  let year: number;
  let week: number;
  
  if (targetWeek.includes('-W')) {
    // Format: YYYY-WXX (e.g., 2025-W01)
    const [yearStr, weekStr] = targetWeek.split('-W');
    year = parseInt(yearStr);
    week = parseInt(weekStr);
  } else if (targetWeek.startsWith('W')) {
    // Format: WXX-YYYY (e.g., W01-2025)
    const parts = targetWeek.split('-');
    week = parseInt(parts[0].replace('W', ''));
    year = parseInt(parts[1]);
  } else {
    // Fallback: try to extract any numbers
    const matches = targetWeek.match(/\d+/g);
    if (matches && matches.length >= 2) {
      if (parseInt(matches[1]) > 100) {
        week = parseInt(matches[0]);
        year = parseInt(matches[1]);
      } else {
        year = parseInt(matches[0]);
        week = parseInt(matches[1]);
      }
    } else {
      // Fallback to current month
      const now = new Date();
      year = now.getFullYear();
      week = 1;
    }
  }
  
  // Calculate date from week
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + (week - 1) * 7);
  
  // Get start of month and format as YYYY-MM
  const monthStart = startOfMonth(date);
  return format(monthStart, 'yyyy-MM');
}

// Helper to get current week info
const getCurrentWeekInfo = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `Week ${weekNum}, ${now.getFullYear()}`;
};

export default function Overview() {
  const { t } = useTranslation();
  const { role } = useRole();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Fetch current farmer/mpk data
  const { data: currentFarmer } = useCurrentFarmer();
  const { data: currentMpk } = useCurrentMpk();
  const { isObserver, isLoading: observerLoading } = useIsObserver();
  const { isObserver: isMpkObserver, isLoading: accountStatusLoading } = useAccountStatus();
  
  // Get farmer status config based on grading
  const farmerStatus = getGradingConfig(currentFarmer?.grading);
  
  // Fetch real data - optimize for role
  // Only fetch data that's needed for the current role
  const { data: farmers = [] } = useFarmers();
  const { data: mpks = [] } = useMpks();
  const { data: batches = [] } = useBatches();
  // Pool requests are only needed for admin and MPK, not for farmers
  // Farmers see aggregated demand via useAggregatedDemand hook
  const { data: poolRequests = [] } = (role === 'admin' || role === 'mpk') ? usePoolRequests() : { data: [] };

  // Filter batches for current user (farmer role)
  const userBatches = useMemo(() => {
    if (role === 'farmer' && user?.id) {
      return batches.filter(b => b.user_id === user.id);
    }
    return batches;
  }, [batches, role, user?.id]);

  // Check if farmer has any batches (excluding draft)
  const hasActiveBatches = useMemo(() => {
    if (role !== 'farmer') return false;
    return userBatches.some(b => b.status !== 'draft');
  }, [userBatches, role]);

  // Filter requests for current MPK
  const mpkRequests = useMemo(() => {
    if (role === 'mpk' && currentMpk?.mpk_id) {
      return poolRequests.filter(r => r.mpk_id === currentMpk.mpk_id);
    }
    return poolRequests;
  }, [poolRequests, role, currentMpk?.mpk_id]);

  const handleActionClick = (batchNumber: string, action: string) => {
    navigate(`/farmer/batch/${batchNumber}?action=${action}`);
  };

  // Calculate admin metrics from real data
  const activeFarmers = farmers.filter(f => f.registration_status === 'active').length;
  const activeMpks = mpks.filter(m => m.registration_status === 'active').length;
  // Only count active batch statuses (forecast, soft_committed, confirmed)
  // Exclude draft (not yet declared), matched (already matched), closed (completed)
  const totalDeclaredVolume = batches
    .filter(b => ['forecast', 'soft_committed', 'confirmed'].includes(b.status))
    .reduce((sum, b) => sum + b.heads, 0);
  const activePoolRequests = poolRequests.filter(r => r.status === 'submitted' || r.status === 'matching' || r.status === 'partial').length;

  // Calculate supply totals
  const supplyTotals = {
    forecast: batches.filter(b => b.status === 'forecast').reduce((sum, b) => sum + b.heads, 0),
    softCommitted: batches.filter(b => b.status === 'soft_committed').reduce((sum, b) => sum + b.heads, 0),
    confirmed: batches.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.heads, 0),
  };

  // Calculate demand totals
  const demandTotals = {
    submitted: poolRequests.filter(r => r.status === 'submitted' || r.status === 'matching').reduce((sum, r) => sum + r.required_volume, 0),
    partial: poolRequests.filter(r => r.status === 'partial').reduce((sum, r) => sum + r.required_volume, 0),
    fulfilled: poolRequests.filter(r => r.status === 'fulfilled').reduce((sum, r) => sum + r.required_volume, 0),
  };

  // Calculate regional breakdown
  // Only count active batch statuses for supply (forecast, soft_committed, confirmed)
  // Only count active request statuses for demand (submitted, matching, partial)
  const regions = [...new Set([...batches.map(b => b.region), ...poolRequests.flatMap(r => r.regions)])];
  const byRegion = regions.map(region => ({
    region,
    supply: batches
      .filter(b => b.region === region && ['forecast', 'soft_committed', 'confirmed'].includes(b.status))
      .reduce((sum, b) => sum + b.heads, 0),
    demand: poolRequests
      .filter(r => r.regions.includes(region) && ['submitted', 'matching', 'partial'].includes(r.status))
      .reduce((sum, r) => sum + r.required_volume, 0),
  })).filter(r => r.supply > 0 || r.demand > 0);

  // Calculate monthly breakdown from real data based on target_week
  const byMonth = useMemo(() => {
    const monthData: Record<string, { 
      supply: { forecast: number; softCommitted: number; confirmed: number }; 
      demand: { submitted: number; partial: number; fulfilled: number };
    }> = {};

    batches.forEach(batch => {
      // Parse target_week to get proper month key (e.g., "2025-01" for January 2025)
      const monthKey = getMonthKeyFromTargetWeek(batch.target_week);
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = {
          supply: { forecast: 0, softCommitted: 0, confirmed: 0 },
          demand: { submitted: 0, partial: 0, fulfilled: 0 },
        };
      }
      
      // Only count active batch statuses
      if (['forecast', 'soft_committed', 'confirmed'].includes(batch.status)) {
        if (batch.status === 'forecast') monthData[monthKey].supply.forecast += batch.heads;
        if (batch.status === 'soft_committed') monthData[monthKey].supply.softCommitted += batch.heads;
        if (batch.status === 'confirmed') monthData[monthKey].supply.confirmed += batch.heads;
      }
    });

    poolRequests.forEach(request => {
      const monthKey = getMonthKeyFromTargetWeek(request.target_week);
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = {
          supply: { forecast: 0, softCommitted: 0, confirmed: 0 },
          demand: { submitted: 0, partial: 0, fulfilled: 0 },
        };
      }
      
      // Only count active request statuses for demand
      if (request.status === 'submitted' || request.status === 'matching') {
        monthData[monthKey].demand.submitted += request.required_volume;
      }
      if (request.status === 'partial') {
        monthData[monthKey].demand.partial += request.required_volume;
      }
      // Note: fulfilled is included for historical tracking, but not in active demand
      if (request.status === 'fulfilled') {
        monthData[monthKey].demand.fulfilled += request.required_volume;
      }
    });

    return Object.entries(monthData)
      .map(([monthKey, data]) => {
        // Format month key for display (e.g., "2025-01" -> "January 2025")
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthLabel = format(date, 'MMMM yyyy');
        
        return { month: monthLabel, monthKey, ...data };
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(0, 6); // Show up to 6 months
  }, [batches, poolRequests]);

  // Generate attention items from real data
  const attentionItems = useMemo(() => [
    ...poolRequests
      .filter(r => (r.status === 'submitted' || r.status === 'matching') && r.matched_volume < r.required_volume * 0.3)
      .slice(0, 2)
      .map(r => ({
        id: r.id,
        type: 'request_at_risk' as const,
        title: `Request ${r.request_number} at risk`,
        description: `Only ${Math.round((r.matched_volume / r.required_volume) * 100)}% filled for ${r.target_week}`,
        severity: 'high' as const,
        linkTo: '/admin/matching',
        linkLabel: 'Review',
      })),
    ...farmers
      .filter(f => f.reliability === 'low')
      .slice(0, 2)
      .map(f => ({
        id: f.id,
        type: 'farmer_declining' as const,
        title: `${f.name} reliability declining`,
        description: `${f.missed_updates} missed updates, ${f.total_declines} declines`,
        severity: 'medium' as const,
        linkTo: '/admin/farmers',
        linkLabel: 'Review',
      })),
    ...mpks
      .filter(m => m.status === 'restricted')
      .slice(0, 2)
      .map(m => ({
        id: m.id,
        type: 'mpk_stalled' as const,
        title: `${m.name} restricted`,
        description: m.restriction_reason || 'Request behavior flagged',
        severity: 'medium' as const,
        linkTo: '/admin/mpks',
        linkLabel: 'Review',
      })),
  ], [poolRequests, farmers, mpks]);

  // Define stat type for type safety
  type StatItem = {
    label: string;
    value: string;
    icon: typeof Boxes;
    highlight?: boolean;
    description?: string;
  };

  // Generate farmer stats from real data
  const farmerStats = useMemo((): StatItem[] => {
    const total = userBatches.length;
    const requiresAction = userBatches.filter(b => b.requires_action).length;
    const confirmed = userBatches.filter(b => b.status === 'confirmed').length;
    
    // Calculate total heads by status
    const totalHeads = userBatches.reduce((sum, b) => sum + b.heads, 0);
    const confirmedHeads = userBatches.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.heads, 0);
    const softCommittedHeads = userBatches.filter(b => b.status === 'soft_committed').reduce((sum, b) => sum + b.heads, 0);
    
    return [
      { label: 'Активные партии', value: String(total), icon: Boxes, description: `${totalHeads} голов всего` },
      { label: 'Требуют действия', value: String(requiresAction), icon: AlertCircle, highlight: requiresAction > 0, description: 'Требуют внимания' },
      { label: 'Подтверждённые', value: String(confirmed), icon: CheckCircle2, description: `${confirmedHeads} голов готовы` },
    ];
  }, [userBatches]);

  // Generate MPK stats from real data
  const mpkStats = useMemo((): StatItem[] => {
    // Available batches for this MPK's regions
    const availableBatches = batches.filter(b => 
      ['confirmed', 'soft_committed', 'forecast'].includes(b.status) &&
      (!currentMpk?.intake_regions?.length || currentMpk.intake_regions.includes(b.region))
    );
    
    const activeRequests = mpkRequests.filter(r => 
      r.status === 'submitted' || r.status === 'matching' || r.status === 'partial'
    ).length;
    
    const totalVolume = mpkRequests.reduce((sum, r) => sum + r.required_volume, 0);
    const matchedVolume = mpkRequests.reduce((sum, r) => sum + r.matched_volume, 0);
    const fillRate = totalVolume > 0 ? Math.round((matchedVolume / totalVolume) * 100) : 0;
    
    return [
      { label: 'Доступные партии', value: String(availableBatches.length), icon: Boxes },
      { label: 'В отслеживании', value: String(availableBatches.filter(b => b.status === 'confirmed').length), icon: CheckCircle2 },
      { label: 'Активные заявки', value: String(activeRequests), icon: Clock },
      { label: 'Заполнение пула', value: `${fillRate}%`, icon: TrendingUp },
    ];
  }, [batches, mpkRequests, currentMpk]);

  // Generate activity feed from real batch data
  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      batchNumber: string;
      description: string;
      status: 'forecast' | 'soft-committed' | 'confirmed';
      time: string;
      action: string | null;
      actionLabel: string | null;
      priority: 'high' | 'medium' | 'info';
    }> = [];

    // Add batches requiring action
    userBatches
      .filter(b => b.requires_action)
      .slice(0, 3)
      .forEach(b => {
        activities.push({
          id: b.id,
          batchNumber: b.batch_number,
          description: b.action_type === 'confirm' 
            ? `Партия #${b.batch_number} готова к подтверждению`
            : b.action_type === 'update'
            ? `Данные партии #${b.batch_number} неполные`
            : `Партия #${b.batch_number} требует внимания`,
          status: b.status === 'soft_committed' ? 'soft-committed' : b.status as 'forecast' | 'confirmed',
          time: formatRelativeTime(b.updated_at),
          action: b.action_type || 'review',
          actionLabel: b.action_type === 'confirm' ? 'Подтвердить' : 'Обновить',
          priority: 'high',
        });
      });

    // Add recent confirmed batches
    userBatches
      .filter(b => b.status === 'confirmed' && !b.requires_action)
      .slice(0, 2)
      .forEach(b => {
        activities.push({
          id: b.id,
          batchNumber: b.batch_number,
          description: `Партия #${b.batch_number} подтверждена`,
          status: 'confirmed',
          time: formatRelativeTime(b.updated_at),
          action: null,
          actionLabel: null,
          priority: 'info',
        });
      });

    return activities.slice(0, 5);
  }, [userBatches]);

  // Farmer batch summary from real data (count and volume)
  const farmerBatchSummary = useMemo(() => {
    const confirmed = userBatches.filter(b => b.status === 'confirmed');
    const softCommitted = userBatches.filter(b => b.status === 'soft_committed');
    const forecast = userBatches.filter(b => b.status === 'forecast');
    const matched = userBatches.filter(b => b.status === 'matched');
    
    return {
      confirmed: {
        count: confirmed.length,
        heads: confirmed.reduce((sum, b) => sum + b.heads, 0),
      },
      softCommitted: {
        count: softCommitted.length,
        heads: softCommitted.reduce((sum, b) => sum + b.heads, 0),
      },
      forecast: {
        count: forecast.length,
        heads: forecast.reduce((sum, b) => sum + b.heads, 0),
      },
      matched: {
        count: matched.length,
        heads: matched.reduce((sum, b) => sum + b.heads, 0),
      },
    };
  }, [userBatches]);

  // Admin Dashboard
  if (role === 'admin') {
    return (
      <MainLayout>
        <PageHeader 
          title={t('admin.platformOverview')} 
          description={t('admin.commandControl')} 
        />

        {/* Matching Window Banner */}
        <div className="mb-6">
          <CurrentMatchingWindowBanner />
        </div>

        {/* System Health Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">{t('admin.systemHealth')}</h2>
          <SystemHealthSummary
            activeFarmers={activeFarmers}
            activeMpks={activeMpks}
            totalDeclaredVolume={totalDeclaredVolume}
            activePoolRequests={activePoolRequests}
          />
        </div>

        {/* Supply vs Demand Snapshot */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">{t('admin.supplyVsDemand')}</h2>
          <SupplyDemandSnapshot
            supplyTotals={supplyTotals}
            demandTotals={demandTotals}
            byRegion={byRegion}
            byMonth={byMonth}
          />
        </div>

        {/* Attention Required */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">{t('admin.attentionRequired')}</h2>
          <AttentionRequired items={attentionItems} />
        </div>
      </MainLayout>
    );
  }

  // Observer Dashboard - Simplified view for pending activation
  // Only show when data is loaded and confirmed as observer
  if (role === 'farmer' && !observerLoading && isObserver) {
    return (
      <MainLayout>
        <PageHeader 
          title="Обзор" 
          description={`Добро пожаловать в Turan Standard Pool`} 
        />
        <ObserverDashboard farmerName={currentFarmer?.name} />
      </MainLayout>
    );
  }

  // Observer MPK Dashboard - Simplified view for pending activation
  // Only show when data is loaded and confirmed as observer
  if (role === 'mpk' && !accountStatusLoading && isMpkObserver) {
    return (
      <MainLayout>
        <PageHeader 
          title="Обзор" 
          description={`Добро пожаловать в Turan Standard Pool`} 
        />
        <ObserverMpkDashboard mpkName={currentMpk?.name} />
      </MainLayout>
    );
  }

  // Farmer and MPK Dashboard
  const currentStats = role === 'farmer' ? farmerStats : mpkStats;
  const roleTitle = role === 'farmer' ? t('overview.farmerTitle') : t('overview.mpkTitle');

  return (
    <MainLayout>
      <PageHeader 
        title={t('overview.title')} 
        description={`${t('auth.welcomeBack')}, Turan Standard Pool — ${roleTitle}`} 
      />

      {/* Farmer Status Banner */}
      {role === 'farmer' && (
        <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              {/* Status Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">{t('farmerOverview.yourGradingLevel')}:</span>
                      <Badge variant="outline" className="font-semibold bg-primary/10 text-primary border-primary/30">
                        {farmerStatus.gradingLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {farmerStatus.gradingDescription}
                    </p>
                  </div>
                </div>
                
                {/* Grading Progress */}
                <div className="flex items-center gap-1">
                  {farmerStatus.gradingLevels.map((level, idx) => (
                    <div key={level.name} className="flex items-center">
                      <div className={`px-3 py-1.5 rounded text-xs font-medium ${
                        level.active 
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {level.name}
                      </div>
                      {idx < farmerStatus.gradingLevels.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Access & Next Action */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-confirmed" />
                  <span className="text-sm text-muted-foreground">{t('farmerOverview.access')}:</span>
                  <span className="text-sm font-medium text-foreground">{farmerStatus.accessLevel}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{t('farmerOverview.nextStep')}:</span>
                  <span className="text-sm text-foreground">{farmerStatus.nextAction}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Calendar - for Farmer and MPK */}
      {(role === 'farmer' || role === 'mpk') && (
        <div className="mb-6">
          <MarketCalendar />
        </div>
      )}

      {/* Current Matching Window Banner */}
      {role === 'farmer' && (
        <div className="mb-6">
          <CurrentMatchingWindowBanner />
        </div>
      )}

      {/* First Action Prompt - Show for active users without first action */}
      {(role === 'farmer' || role === 'mpk') && !isObserver && (
        <div className="mb-6">
          <FirstActionPrompt />
        </div>
      )}

      {/* Batch Onboarding - Show for farmers without active batches */}
      {role === 'farmer' && !isObserver && !hasActiveBatches && (
        <div className="mb-6">
          <BatchOnboarding />
        </div>
      )}

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${role === 'farmer' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {currentStats.map((stat, index) => (
          <Card key={index} className={stat.highlight ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.highlight ? 'text-amber-600' : 'text-foreground'}`}>{stat.value}</p>
                  {'description' in stat && stat.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.highlight ? 'bg-amber-500/10' : 'bg-secondary'}`}>
                  <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-amber-600' : 'text-primary'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relevant Market Signals for Farmer */}
      {role === 'farmer' && (
        <div className="mb-6">
          <RelevantMarketSignals />
        </div>
      )}

      {/* Aggregated Demand Signals for Farmer */}
      {role === 'farmer' && (
        <div className="mb-6">
          <AggregatedDemandCard />
        </div>
      )}

      {/* Reliability Premium Card for Farmer */}
      {role === 'farmer' && currentFarmer?.grading && (
        <div className="mb-6">
          <ReliabilityPremiumCard farmerGrading={currentFarmer.grading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">
              {role === 'farmer' ? t('overview.actionFeed') : t('overview.recentActivity')}
            </CardTitle>
            {role === 'farmer' && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                {recentActivity.filter(a => a.action).length} {t('overview.pending')}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-center justify-between py-3 px-3 rounded-lg border transition-colors ${
                      activity.priority === 'high' 
                        ? 'border-amber-500/40 bg-amber-500/5' 
                        : activity.priority === 'medium'
                        ? 'border-amber-500/20 bg-amber-500/[0.02]'
                        : 'border-border/50 bg-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {activity.priority === 'high' && (
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        )}
                        {activity.priority === 'info' && (
                          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <p className={`text-sm truncate ${
                          activity.action ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        <StatusBadge status={activity.status} />
                      </div>
                    </div>
                    {activity.action && (
                      <Button 
                        variant={activity.priority === 'high' ? 'default' : 'outline'} 
                        size="sm" 
                        className="ml-3 flex-shrink-0"
                        onClick={() => handleActionClick(activity.batchNumber, activity.action!)}
                      >
                        {activity.actionLabel}
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Нет активных действий
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform Status</span>
                <span className="text-sm font-medium text-status-confirmed">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Sync</span>
                <span className="text-sm text-foreground">Real-time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Pool Period</span>
                <span className="text-sm text-foreground">{getCurrentWeekInfo()}</span>
              </div>
            </div>
            
            {role === 'farmer' && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Your Batch Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-status-confirmed/10 rounded text-center">
                    <p className="text-lg font-semibold text-status-confirmed">{farmerBatchSummary.confirmed.count}</p>
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{farmerBatchSummary.confirmed.heads} heads</p>
                  </div>
                  <div className="p-2 bg-status-soft-committed/10 rounded text-center">
                    <p className="text-lg font-semibold text-status-soft-committed">{farmerBatchSummary.softCommitted.count}</p>
                    <p className="text-xs text-muted-foreground">Soft Comm.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{farmerBatchSummary.softCommitted.heads} heads</p>
                  </div>
                  <div className="p-2 bg-status-forecast/10 rounded text-center">
                    <p className="text-lg font-semibold text-status-forecast">{farmerBatchSummary.forecast.count}</p>
                    <p className="text-xs text-muted-foreground">Forecast</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{farmerBatchSummary.forecast.heads} heads</p>
                  </div>
                  {farmerBatchSummary.matched.count > 0 && (
                    <div className="p-2 bg-blue-500/10 rounded text-center">
                      <p className="text-lg font-semibold text-blue-600">{farmerBatchSummary.matched.count}</p>
                      <p className="text-xs text-muted-foreground">Matched</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{farmerBatchSummary.matched.heads} heads</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
