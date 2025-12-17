import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LIVESTOCK_BREEDS, 
  LIVESTOCK_GENDERS,
  AGE_RANGE,
  WEIGHT_RANGE,
  type AcceptanceCriteria 
} from '@/lib/livestock-criteria';
import { Info } from 'lucide-react';

interface AcceptanceCriteriaFormProps {
  value: AcceptanceCriteria;
  onChange: (criteria: AcceptanceCriteria) => void;
  compact?: boolean;
}

export function AcceptanceCriteriaForm({ value, onChange, compact = false }: AcceptanceCriteriaFormProps) {
  const toggleBreed = (breed: string) => {
    const breeds = value.accepted_breeds.includes(breed)
      ? value.accepted_breeds.filter(b => b !== breed)
      : [...value.accepted_breeds, breed];
    onChange({ ...value, accepted_breeds: breeds });
  };

  const toggleGender = (gender: string) => {
    const genders = value.accepted_genders.includes(gender)
      ? value.accepted_genders.filter(g => g !== gender)
      : [...value.accepted_genders, gender];
    onChange({ ...value, accepted_genders: genders });
  };

  return (
    <div className={`space-y-${compact ? '4' : '6'}`}>
      {/* Breeds */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Accepted Breeds</Label>
        <p className="text-xs text-muted-foreground mb-2">Select breeds you can accept</p>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-2`}>
          {LIVESTOCK_BREEDS.map((breed) => (
            <div key={breed} className="flex items-center space-x-2">
              <Checkbox
                id={`breed-${breed}`}
                checked={value.accepted_breeds.includes(breed)}
                onCheckedChange={() => toggleBreed(breed)}
              />
              <label
                htmlFor={`breed-${breed}`}
                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {breed}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Accepted Genders</Label>
        <div className="flex flex-wrap gap-4">
          {LIVESTOCK_GENDERS.map((gender) => (
            <div key={gender} className="flex items-center space-x-2">
              <Checkbox
                id={`gender-${gender}`}
                checked={value.accepted_genders.includes(gender)}
                onCheckedChange={() => toggleGender(gender)}
              />
              <label
                htmlFor={`gender-${gender}`}
                className="text-sm cursor-pointer leading-none"
              >
                {gender}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Age Range (months)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            className="w-24"
            placeholder={String(AGE_RANGE.min)}
            value={value.age_range_min ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              age_range_min: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={AGE_RANGE.min}
            max={AGE_RANGE.max}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            className="w-24"
            placeholder={String(AGE_RANGE.max)}
            value={value.age_range_max ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              age_range_max: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={AGE_RANGE.min}
            max={AGE_RANGE.max}
          />
          <span className="text-sm text-muted-foreground">months</span>
        </div>
      </div>

      {/* Weight Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Weight Range (kg)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            className="w-24"
            placeholder={String(WEIGHT_RANGE.min)}
            value={value.weight_range_min ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              weight_range_min: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={WEIGHT_RANGE.min}
            max={WEIGHT_RANGE.max}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            className="w-24"
            placeholder={String(WEIGHT_RANGE.max)}
            value={value.weight_range_max ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              weight_range_max: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={WEIGHT_RANGE.min}
            max={WEIGHT_RANGE.max}
          />
          <span className="text-sm text-muted-foreground">kg</span>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Only batches matching acceptance criteria can be included in pool matching.
        </p>
      </div>
    </div>
  );
}
