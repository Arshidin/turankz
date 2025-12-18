import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SupplyData {
  forecast: number;
  softCommitted: number;
  confirmed: number;
}

interface DemandData {
  submitted: number; // Combined submitted + matching
  partial: number;
  fulfilled: number;
}

interface RegionBreakdown {
  region: string;
  supply: number;
  demand: number;
}

interface MonthBreakdown {
  month: string;
  supply: SupplyData;
  demand: DemandData;
}

interface SupplyDemandSnapshotProps {
  supplyTotals: SupplyData;
  demandTotals: DemandData;
  byRegion: RegionBreakdown[];
  byMonth: MonthBreakdown[];
}

export function SupplyDemandSnapshot({
  supplyTotals,
  demandTotals,
  byRegion,
  byMonth,
}: SupplyDemandSnapshotProps) {
  const totalSupply = supplyTotals.forecast + supplyTotals.softCommitted + supplyTotals.confirmed;
  const totalDemand = demandTotals.submitted + demandTotals.partial + demandTotals.fulfilled;
  const balance = totalSupply - totalDemand;
  const balancePercentage = totalDemand > 0 ? Math.round((totalSupply / totalDemand) * 100) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Supply vs Demand Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Supply vs Demand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supply Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Declared Supply</span>
              <span className="text-sm font-bold text-foreground">{totalSupply.toLocaleString()} heads</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
              <div 
                className="bg-status-confirmed" 
                style={{ width: `${(supplyTotals.confirmed / totalSupply) * 100}%` }} 
              />
              <div 
                className="bg-status-soft-committed" 
                style={{ width: `${(supplyTotals.softCommitted / totalSupply) * 100}%` }} 
              />
              <div 
                className="bg-status-forecast" 
                style={{ width: `${(supplyTotals.forecast / totalSupply) * 100}%` }} 
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-confirmed" />
                Confirmed: {supplyTotals.confirmed}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-soft-committed" />
                Soft: {supplyTotals.softCommitted}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-forecast" />
                Forecast: {supplyTotals.forecast}
              </span>
            </div>
          </div>

          {/* Demand Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Requested Demand</span>
              <span className="text-sm font-bold text-foreground">{totalDemand.toLocaleString()} heads</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
              <div 
                className="bg-green-500" 
                style={{ width: `${(demandTotals.fulfilled / totalDemand) * 100}%` }} 
              />
              <div 
                className="bg-amber-500" 
                style={{ width: `${(demandTotals.partial / totalDemand) * 100}%` }} 
              />
              <div 
                className="bg-slate-400" 
                style={{ width: `${(demandTotals.submitted / totalDemand) * 100}%` }} 
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Fulfilled: {demandTotals.fulfilled}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Partial: {demandTotals.partial}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Submitted: {demandTotals.submitted}
              </span>
            </div>
          </div>

          {/* Balance Indicator */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Supply Coverage</span>
              <span className={`text-sm font-bold ${balancePercentage >= 100 ? 'text-status-confirmed' : 'text-amber-600'}`}>
                {balancePercentage}%
              </span>
            </div>
            <Progress value={Math.min(balancePercentage, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {balance >= 0 
                ? `${balance.toLocaleString()} heads surplus available`
                : `${Math.abs(balance).toLocaleString()} heads deficit`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">By Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {byRegion.map((region) => {
              const coverage = region.demand > 0 ? Math.round((region.supply / region.demand) * 100) : 100;
              const isDeficit = region.supply < region.demand;
              
              return (
                <div key={region.region} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{region.region}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        S: {region.supply} / D: {region.demand}
                      </span>
                      <span className={`font-medium ${isDeficit ? 'text-amber-600' : 'text-status-confirmed'}`}>
                        {coverage}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full ${isDeficit ? 'bg-amber-500' : 'bg-status-confirmed'}`}
                      style={{ width: `${Math.min(coverage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">By Month (Next 3 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {byMonth.map((month) => {
              const monthSupply = month.supply.forecast + month.supply.softCommitted + month.supply.confirmed;
              const monthDemand = month.demand.submitted + month.demand.partial + month.demand.fulfilled;
              const coverage = monthDemand > 0 ? Math.round((monthSupply / monthDemand) * 100) : 100;
              
              return (
                <div key={month.month} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <h4 className="text-sm font-medium text-foreground mb-3">{month.month}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Supply</span>
                      <span className="font-medium text-foreground">{monthSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="bg-status-confirmed rounded-l" style={{ flex: month.supply.confirmed }} />
                      <div className="bg-status-soft-committed" style={{ flex: month.supply.softCommitted }} />
                      <div className="bg-status-forecast rounded-r" style={{ flex: month.supply.forecast }} />
                    </div>
                    
                    <div className="flex justify-between text-xs pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Demand</span>
                      <span className="font-medium text-foreground">{monthDemand.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="bg-green-500 rounded-l" style={{ flex: month.demand.fulfilled }} />
                      <div className="bg-amber-500" style={{ flex: month.demand.partial }} />
                      <div className="bg-slate-400 rounded-r" style={{ flex: month.demand.submitted }} />
                    </div>
                    
                    <div className={`text-center pt-2 text-sm font-bold ${coverage >= 100 ? 'text-status-confirmed' : 'text-amber-600'}`}>
                      {coverage}% coverage
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
