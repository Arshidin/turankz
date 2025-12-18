import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

export interface WorkspaceFilters {
  region: string;
  minWeight: number | undefined;
  maxWeight: number | undefined;
  minAge: number | undefined;
  maxAge: number | undefined;
  minVolume: number | undefined;
}

interface MatchingWorkspaceFiltersProps {
  filters: WorkspaceFilters;
  onFiltersChange: (filters: WorkspaceFilters) => void;
  regions: string[];
}

export function MatchingWorkspaceFilters({
  filters,
  onFiltersChange,
  regions,
}: MatchingWorkspaceFiltersProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.region !== 'all' ||
    filters.minWeight !== undefined ||
    filters.maxWeight !== undefined ||
    filters.minAge !== undefined ||
    filters.maxAge !== undefined ||
    filters.minVolume !== undefined;

  const activeFilterCount = [
    filters.region !== 'all',
    filters.minWeight !== undefined || filters.maxWeight !== undefined,
    filters.minAge !== undefined || filters.maxAge !== undefined,
    filters.minVolume !== undefined,
  ].filter(Boolean).length;

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      region: 'all',
      minWeight: undefined,
      maxWeight: undefined,
      minAge: undefined,
      maxAge: undefined,
      minVolume: undefined,
    });
  }, [onFiltersChange]);

  const handleNumberChange = (
    field: keyof WorkspaceFilters,
    value: string
  ) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter Supply & Demand</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleClearFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="grid gap-3">
              {/* Region Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs">Region</Label>
                <Select
                  value={filters.region}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, region: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Range */}
              <div className="space-y-1.5">
                <Label className="text-xs">Weight Range (kg)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-8 text-xs"
                    value={filters.minWeight ?? ''}
                    onChange={(e) => handleNumberChange('minWeight', e.target.value)}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-8 text-xs"
                    value={filters.maxWeight ?? ''}
                    onChange={(e) => handleNumberChange('maxWeight', e.target.value)}
                  />
                </div>
              </div>

              {/* Age Range */}
              <div className="space-y-1.5">
                <Label className="text-xs">Age Range (months)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-8 text-xs"
                    value={filters.minAge ?? ''}
                    onChange={(e) => handleNumberChange('minAge', e.target.value)}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-8 text-xs"
                    value={filters.maxAge ?? ''}
                    onChange={(e) => handleNumberChange('maxAge', e.target.value)}
                  />
                </div>
              </div>

              {/* Minimum Volume */}
              <div className="space-y-1.5">
                <Label className="text-xs">Min Available/Remaining Volume</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  className="h-8 text-xs"
                  value={filters.minVolume ?? ''}
                  onChange={(e) => handleNumberChange('minVolume', e.target.value)}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleClearFilters}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
