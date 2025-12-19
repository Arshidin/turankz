/**
 * TOP NAVIGATION
 * 
 * Role-switcher ONLY for Admin (TURAN).
 * For Farmer and MPK, role is displayed as read-only label.
 * Includes logout functionality.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, ChevronDown, LogOut, Settings, Shield, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications';
import { LanguageSwitcher } from './LanguageSwitcher';
import { toast } from '@/hooks/use-toast';

const roleConfig: Record<UserRole, { label: string; labelRu: string; badgeClass: string }> = {
  admin: { 
    label: 'Admin', 
    labelRu: 'Администратор',
    badgeClass: 'bg-primary/10 text-primary border-primary/20' 
  },
  farmer: { 
    label: 'Farmer', 
    labelRu: 'Фермер',
    badgeClass: 'bg-status-confirmed-bg text-status-confirmed border-status-confirmed/20' 
  },
  mpk: { 
    label: 'MPK', 
    labelRu: 'МПК',
    badgeClass: 'bg-status-soft-bg text-status-soft border-status-soft/20' 
  },
};

export function TopNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const { user, signOut } = useAuthContext();
  const { accountStatus, isObserver, getStatusLabel } = useAccountStatus();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const config = roleConfig[role];
  const lang = localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en';
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      // Clear local state regardless of server response
      // Session might already be expired on server (which returns error)
      // but we should still clear local state and redirect
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
      
      if (error && !error.message?.includes('session_not_found') && !error.message?.includes('Session not found')) {
        // Only show error for unexpected failures, not for already-expired sessions
        console.warn('Sign out warning:', error.message);
      }
      
      navigate('/auth');
    } catch (err) {
      // Even on exception, clear state and redirect
      sessionStorage.clear();
      navigate('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        
        {/* Role Badge - Read-only display */}
        <Badge variant="outline" className={config.badgeClass}>
          {lang === 'ru' ? config.labelRu : config.label}
        </Badge>
        
        {/* Observer Mode Indicator - Clear role label for non-admin observers */}
        {role !== 'admin' && isObserver && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs">
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-400 font-medium">Observer</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground text-[11px]">
              {lang === 'ru' ? 'Только просмотр' : 'Read-only'}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground text-[11px]">
              {lang === 'ru' ? 'Без участия' : 'No participation'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Notifications, Role Selector (Admin only) & User Menu */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* Notifications */}
        <NotificationBell />

        {/* Role Selector - ONLY for Admin (for testing/governance purposes) */}
        {role === 'admin' && (
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
                  {lang === 'ru' ? 'Фермер (тест)' : 'Farmer (test)'}
                </span>
              </SelectItem>
              <SelectItem value="mpk">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-soft" />
                  {lang === 'ru' ? 'МПК (тест)' : 'MPK (test)'}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* User Menu with Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-3 py-1.5 h-auto rounded-md bg-secondary/50 hover:bg-secondary/80 border border-transparent hover:border-border"
            >
              <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground max-w-[100px] truncate">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
                  {lang === 'ru' ? config.labelRu : config.label}
                  {role !== 'admin' && (
                    <>
                      <span>•</span>
                      <span>{getStatusLabel(lang)}</span>
                    </>
                  )}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {role === 'admin' && (
              <>
                <DropdownMenuItem className="flex items-center gap-2" disabled>
                  <Shield className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Режим администратора' : 'Admin Mode'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>
                {isLoggingOut 
                  ? (lang === 'ru' ? 'Выход...' : 'Signing out...') 
                  : (lang === 'ru' ? 'Выйти' : 'Sign Out')
                }
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
