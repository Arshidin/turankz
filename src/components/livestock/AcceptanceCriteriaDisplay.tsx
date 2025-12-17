import { Badge } from '@/components/ui/badge';
import { type AcceptanceCriteria, formatCriteriaDisplay } from '@/lib/livestock-criteria';

interface AcceptanceCriteriaDisplayProps {
  criteria: AcceptanceCriteria;
  compact?: boolean;
}

export function AcceptanceCriteriaDisplay({ criteria, compact = false }: AcceptanceCriteriaDisplayProps) {
  const parts = formatCriteriaDisplay(criteria);
  
  if (parts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No specific acceptance criteria defined</p>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {criteria.accepted_breeds.slice(0, 2).map((breed) => (
          <Badge key={breed} variant="outline" className="text-xs">
            {breed}
          </Badge>
        ))}
        {criteria.accepted_breeds.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{criteria.accepted_breeds.length - 2} breeds
          </Badge>
        )}
        {criteria.accepted_genders.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {criteria.accepted_genders.join('/')}
          </Badge>
        )}
        {(criteria.age_range_min || criteria.age_range_max) && (
          <Badge variant="outline" className="text-xs">
            {criteria.age_range_min ?? '–'}–{criteria.age_range_max ?? '–'} mo
          </Badge>
        )}
        {(criteria.weight_range_min || criteria.weight_range_max) && (
          <Badge variant="outline" className="text-xs">
            {criteria.weight_range_min ?? '–'}–{criteria.weight_range_max ?? '–'} kg
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => (
        <p key={index} className="text-sm text-foreground">{part}</p>
      ))}
    </div>
  );
}
