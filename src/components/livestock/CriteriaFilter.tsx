import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { LIVESTOCK_BREEDS, LIVESTOCK_GENDERS, type AcceptanceCriteria } from '@/lib/livestock-criteria';

export interface CriteriaFilterState {
  breeds: string[];
  genders: string[];
  ageMin: number | null;
  ageMax: number | null;
  weightMin: number | null;
  weightMax: number | null;
}

interface CriteriaFilterProps {
  filters: CriteriaFilterState;
  onFiltersChange: (filters: CriteriaFilterState) => void;
  className?: string;
}

export const defaultCriteriaFilters: CriteriaFilterState = {
  breeds: [],
  genders: [],
  ageMin: null,
  ageMax: null,
  weightMin: null,
  weightMax: null,
};

export function hasActiveFilters(filters: CriteriaFilterState): boolean {
  return (
    filters.breeds.length > 0 ||
    filters.genders.length > 0 ||
    filters.ageMin !== null ||
    filters.ageMax !== null ||
    filters.weightMin !== null ||
    filters.weightMax !== null
  );
}

export function CriteriaFilter({ filters, onFiltersChange, className }: CriteriaFilterProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    filters.breeds.length > 0,
    filters.genders.length > 0,
    filters.ageMin !== null || filters.ageMax !== null,
    filters.weightMin !== null || filters.weightMax !== null,
  ].filter(Boolean).length;

  const handleBreedToggle = (breed: string) => {
    const newBreeds = filters.breeds.includes(breed)
      ? filters.breeds.filter(b => b !== breed)
      : [...filters.breeds, breed];
    onFiltersChange({ ...filters, breeds: newBreeds });
  };

  const handleGenderChange = (gender: string) => {
    if (gender === 'all') {
      onFiltersChange({ ...filters, genders: [] });
    } else {
      onFiltersChange({ ...filters, genders: [gender] });
    }
  };

  const handleClearAll = () => {
    onFiltersChange(defaultCriteriaFilters);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Criteria Filter
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-popover" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter by Acceptance Criteria</h4>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleClearAll}>
                  Clear all
                </Button>
              )}
            </div>

            {/* Breed Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Breed</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {LIVESTOCK_BREEDS.map((breed) => (
                  <div key={breed} className="flex items-center space-x-2">
                    <Checkbox
                      id={`breed-${breed}`}
                      checked={filters.breeds.includes(breed)}
                      onCheckedChange={() => handleBreedToggle(breed)}
                    />
                    <label
                      htmlFor={`breed-${breed}`}
                      className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {breed}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Gender</Label>
              <Select
                value={filters.genders[0] || 'all'}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {LIVESTOCK_GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age Range Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Age Range (months)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-8 text-xs"
                  value={filters.ageMin ?? ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    ageMin: e.target.value ? parseInt(e.target.value) : null,
                  })}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-8 text-xs"
                  value={filters.ageMax ?? ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    ageMax: e.target.value ? parseInt(e.target.value) : null,
                  })}
                />
              </div>
            </div>

            {/* Weight Range Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Weight Range (kg)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-8 text-xs"
                  value={filters.weightMin ?? ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    weightMin: e.target.value ? parseInt(e.target.value) : null,
                  })}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-8 text-xs"
                  value={filters.weightMax ?? ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    weightMax: e.target.value ? parseInt(e.target.value) : null,
                  })}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              Filters apply to aggregated supply data. Individual farmer data remains anonymous.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.breeds.length > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filters.breeds.length === 1 ? filters.breeds[0] : `${filters.breeds.length} breeds`}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, breeds: [] })}
              />
            </Badge>
          )}
          {filters.genders.length > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filters.genders[0]}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, genders: [] })}
              />
            </Badge>
          )}
          {(filters.ageMin !== null || filters.ageMax !== null) && (
            <Badge variant="secondary" className="text-xs gap-1">
              Age: {filters.ageMin ?? '–'}–{filters.ageMax ?? '–'} mo
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, ageMin: null, ageMax: null })}
              />
            </Badge>
          )}
          {(filters.weightMin !== null || filters.weightMax !== null) && (
            <Badge variant="secondary" className="text-xs gap-1">
              Weight: {filters.weightMin ?? '–'}–{filters.weightMax ?? '–'} kg
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, weightMin: null, weightMax: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
