import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Bell, Check, Clock, Package, TrendingUp, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/hooks/useNotifications';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  pool_invitation: <Users className="h-4 w-4 text-primary" />,
  batch_action_required: <AlertCircle className="h-4 w-4 text-amber-500" />,
  batch_status_changed: <Package className="h-4 w-4 text-blue-500" />,
  grading_updated: <TrendingUp className="h-4 w-4 text-emerald-500" />,
  request_status_changed: <Package className="h-4 w-4 text-blue-500" />,
  watchlist_supply_added: <Bell className="h-4 w-4 text-primary" />,
  matching_window_approaching: <Clock className="h-4 w-4 text-amber-500" />,
  request_at_risk: <AlertCircle className="h-4 w-4 text-destructive" />,
  farmer_declined: <AlertCircle className="h-4 w-4 text-destructive" />,
  request_stalled: <Clock className="h-4 w-4 text-amber-500" />,
  reliability_dropped: <TrendingUp className="h-4 w-4 text-destructive" />,
};

export function NotificationList({ notifications, isLoading, onMarkAsRead }: NotificationListProps) {
  const navigate = useNavigate();

  const handleClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link_to) {
      navigate(notification.link_to);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => handleClick(notification)}
            className={cn(
              'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
              !notification.is_read && 'bg-primary/5',
              notification.is_urgent && !notification.is_read && 'border-l-2 border-l-destructive'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              {NOTIFICATION_ICONS[notification.notification_type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm truncate',
                !notification.is_read && 'font-medium'
              )}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {notification.description}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
