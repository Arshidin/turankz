import { useRole, UserRole } from '@/contexts/RoleContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ChevronDown } from 'lucide-react';

export function TopNav() {
  const { role, setRole, roleName } = useRole();

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TS</span>
          </div>
          <span className="font-semibold text-foreground">Turan Standard Pool</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger className="w-[200px] bg-secondary border-border">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin (TURAN / ZENGI)</SelectItem>
            <SelectItem value="farmer">Farmer</SelectItem>
            <SelectItem value="mpk">Meat Processing Plant</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors">
          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-secondary-foreground">User</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
