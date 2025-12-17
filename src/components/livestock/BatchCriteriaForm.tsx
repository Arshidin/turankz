import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LIVESTOCK_BREEDS, 
  LIVESTOCK_GENDERS,
  AGE_RANGE,
  WEIGHT_RANGE,
  type BatchCriteria 
} from '@/lib/livestock-criteria';

interface BatchCriteriaFormProps {
  value: BatchCriteria;
  onChange: (criteria: BatchCriteria) => void;
}

export function BatchCriteriaForm({ value, onChange }: BatchCriteriaFormProps) {
  return (
    <div className="space-y-4">
      {/* Breed & Gender Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Breed</Label>
          <Select
            value={value.breed || ''}
            onValueChange={(v) => onChange({ ...value, breed: v || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              {LIVESTOCK_BREEDS.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={value.gender || ''}
            onValueChange={(v) => onChange({ ...value, gender: v || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {LIVESTOCK_GENDERS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-2">
        <Label>Age Range (months)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            className="w-24"
            placeholder={String(AGE_RANGE.min)}
            value={value.age_min ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              age_min: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={AGE_RANGE.min}
            max={AGE_RANGE.max}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            className="w-24"
            placeholder={String(AGE_RANGE.max)}
            value={value.age_max ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              age_max: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={AGE_RANGE.min}
            max={AGE_RANGE.max}
          />
          <span className="text-sm text-muted-foreground">months</span>
        </div>
      </div>

      {/* Weight Range */}
      <div className="space-y-2">
        <Label>Weight Range (kg)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            className="w-24"
            placeholder={String(WEIGHT_RANGE.min)}
            value={value.weight_min ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              weight_min: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={WEIGHT_RANGE.min}
            max={WEIGHT_RANGE.max}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            className="w-24"
            placeholder={String(WEIGHT_RANGE.max)}
            value={value.weight_max ?? ''}
            onChange={(e) => onChange({ 
              ...value, 
              weight_max: e.target.value ? parseInt(e.target.value) : null 
            })}
            min={WEIGHT_RANGE.min}
            max={WEIGHT_RANGE.max}
          />
          <span className="text-sm text-muted-foreground">kg</span>
        </div>
      </div>
    </div>
  );
}
