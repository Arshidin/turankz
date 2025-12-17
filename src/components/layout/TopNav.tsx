import { useRole, UserRole } from '@/contexts/RoleContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications';

const roleConfig: Record<UserRole, { label: string; badgeClass: string }> = {
  admin: { 
    label: 'Admin', 
    badgeClass: 'bg-primary/10 text-primary border-primary/20' 
  },
  farmer: { 
    label: 'Farmer', 
    badgeClass: 'bg-status-confirmed-bg text-status-confirmed border-status-confirmed/20' 
  },
  mpk: { 
    label: 'MPK', 
    badgeClass: 'bg-status-soft-bg text-status-soft border-status-soft/20' 
  },
};

export function TopNav() {
  const { role, setRole } = useRole();
  const config = roleConfig[role];

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
      {/* Left: Platform Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TS</span>
          </div>
          <span className="font-semibold text-foreground">Turan Standard Pool</span>
        </div>
        
        {/* Role Badge - Visual indicator of current role */}
        <Badge variant="outline" className={config.badgeClass}>
          {config.label}
        </Badge>
      </div>

      {/* Right: Notifications, Role Selector & User */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationBell />

        {/* Role Selector */}
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger className="w-[180px] bg-secondary/50 border-border text-sm">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Admin (TURAN / ZENGI)
              </span>
            </SelectItem>
            <SelectItem value="farmer">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-confirmed" />
                Farmer
              </span>
            </SelectItem>
            <SelectItem value="mpk">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-soft" />
                Meat Processing Plant
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* User Menu */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors border border-transparent hover:border-border">
          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-foreground">User</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
