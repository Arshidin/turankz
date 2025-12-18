/**
 * MATCHING WINDOW MANAGEMENT (Admin Only)
 * 
 * Full CRUD and lifecycle management for matching windows.
 * Includes activity logging for governance.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Pause,
  Square,
  History,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMatchingWindows,
  useCreateMatchingWindow,
  useUpdateMatchingWindowStatus,
  useUpdateMatchingWindow,
} from '@/hooks/useMatchingWindows';
import {
  type MatchingWindowStatus,
  MATCHING_WINDOW_STATUS_COLORS,
  MATCHING_WINDOW_STATUS_LABELS,
  getAllowedWindowTransitions,
  getWindowTransitionLabel,
} from '@/lib/matching-window';
import { useAuditLog } from '@/hooks/useAuditLog';
import { toast } from '@/hooks/use-toast';

// Form schema for creating/editing windows
const windowFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  target_week: z.string().min(1, 'Target week is required'),
  start_date: z.date({ required_error: 'Start date is required' }),
  lock_date: z.date({ required_error: 'Lock date is required' }),
  close_date: z.date({ required_error: 'Close date is required' }),
  notes: z.string().max(500).optional(),
}).refine(data => data.lock_date > data.start_date, {
  message: 'Lock date must be after start date',
  path: ['lock_date'],
}).refine(data => data.close_date > data.lock_date, {
  message: 'Close date must be after lock date',
  path: ['close_date'],
});

type WindowFormData = z.infer<typeof windowFormSchema>;

// Generate target week options
function getTargetWeekOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i < 16; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i * 7);
    const year = date.getFullYear();
    const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
    const value = `${year}-W${week.toString().padStart(2, '0')}`;
    const label = `Week ${week}, ${year}`;
    options.push({ value, label });
  }
  
  return options;
}

// Status icon component
function StatusIcon({ status }: { status: MatchingWindowStatus }) {
  switch (status) {
    case 'upcoming':
      return <Clock className="h-4 w-4" />;
    case 'active':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'locked':
      return <Lock className="h-4 w-4" />;
    case 'closed':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <CalendarIcon className="h-4 w-4" />;
  }
}

// Transition button component
function TransitionButton({ 
  toStatus, 
  onClick, 
  disabled,
  loading,
}: { 
  toStatus: MatchingWindowStatus; 
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const getIcon = () => {
    switch (toStatus) {
      case 'active':
        return <Play className="h-4 w-4 mr-2" />;
      case 'locked':
        return <Lock className="h-4 w-4 mr-2" />;
      case 'closed':
        return <Square className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (toStatus) {
      case 'active':
        return 'default';
      case 'locked':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Button 
      variant={getVariant()} 
      size="sm" 
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : getIcon()}
      {getWindowTransitionLabel(toStatus)}
    </Button>
  );
}

export function MatchingWindowManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; window: any | null }>({ open: false, window: null });
  const [transitionConfirm, setTransitionConfirm] = useState<{ 
    open: boolean; 
    windowId: string; 
    windowName: string;
    currentStatus: MatchingWindowStatus; 
    newStatus: MatchingWindowStatus;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: windows, isLoading } = useMatchingWindows();
  const createWindow = useCreateMatchingWindow();
  const updateStatus = useUpdateMatchingWindowStatus();
  const updateWindow = useUpdateMatchingWindow();
  const { logMatchingWindowChange } = useAuditLog();

  const weekOptions = getTargetWeekOptions();

  const createForm = useForm<WindowFormData>({
    resolver: zodResolver(windowFormSchema),
    defaultValues: {
      name: '',
      target_week: weekOptions[2]?.value || '',
      start_date: new Date(),
      lock_date: addDays(new Date(), 7),
      close_date: addDays(new Date(), 14),
      notes: '',
    },
  });

  const editForm = useForm<WindowFormData>({
    resolver: zodResolver(windowFormSchema),
  });

  const handleCreate = async (data: WindowFormData) => {
    try {
      await createWindow.mutateAsync({
        name: data.name,
        target_week: data.target_week,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        lock_date: format(data.lock_date, 'yyyy-MM-dd'),
        close_date: format(data.close_date, 'yyyy-MM-dd'),
        notes: data.notes || null,
        status: 'upcoming',
        created_by: 'Admin',
      });

      await logMatchingWindowChange({
        windowName: data.name,
        action: 'created',
        details: `Target: ${data.target_week}, Start: ${format(data.start_date, 'yyyy-MM-dd')}`,
      });

      setCreateDialogOpen(false);
      createForm.reset();
    } catch (error) {
      console.error('Failed to create window:', error);
    }
  };

  const handleEdit = async (data: WindowFormData) => {
    if (!editDialog.window) return;

    try {
      await updateWindow.mutateAsync({
        id: editDialog.window.id,
        name: data.name,
        target_week: data.target_week,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        lock_date: format(data.lock_date, 'yyyy-MM-dd'),
        close_date: format(data.close_date, 'yyyy-MM-dd'),
        notes: data.notes || null,
      });

      await logMatchingWindowChange({
        windowName: data.name,
        action: 'updated',
        details: `Dates modified`,
      });

      setEditDialog({ open: false, window: null });
    } catch (error) {
      console.error('Failed to update window:', error);
    }
  };

  const handleTransition = async () => {
    if (!transitionConfirm) return;

    try {
      await updateStatus.mutateAsync({
        id: transitionConfirm.windowId,
        currentStatus: transitionConfirm.currentStatus,
        newStatus: transitionConfirm.newStatus,
      });

      await logMatchingWindowChange({
        windowName: transitionConfirm.windowName,
        action: 'status_changed',
        details: `${transitionConfirm.currentStatus} → ${transitionConfirm.newStatus}`,
      });

      setTransitionConfirm(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const openEditDialog = (window: any) => {
    editForm.reset({
      name: window.name,
      target_week: window.target_week,
      start_date: parseISO(window.start_date),
      lock_date: parseISO(window.lock_date),
      close_date: parseISO(window.close_date),
      notes: window.notes || '',
    });
    setEditDialog({ open: true, window });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Separate active/locked from other windows
  const activeWindow = windows?.find(w => w.status === 'active' || w.status === 'locked');
  const otherWindows = windows?.filter(w => w.status !== 'active' && w.status !== 'locked') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Matching Windows</h2>
          <p className="text-sm text-muted-foreground">
            Manage time-based market coordination windows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Window
          </Button>
        </div>
      </div>

      {/* Current Active Window Card */}
      {activeWindow && (
        <Card className={`${MATCHING_WINDOW_STATUS_COLORS[activeWindow.status as MatchingWindowStatus].border} border-2`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-medium">Current Window</CardTitle>
                <Badge 
                  variant="outline"
                  className={`${MATCHING_WINDOW_STATUS_COLORS[activeWindow.status as MatchingWindowStatus].bg} ${MATCHING_WINDOW_STATUS_COLORS[activeWindow.status as MatchingWindowStatus].text}`}
                >
                  <StatusIcon status={activeWindow.status as MatchingWindowStatus} />
                  <span className="ml-1">{MATCHING_WINDOW_STATUS_LABELS[activeWindow.status as MatchingWindowStatus]}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getAllowedWindowTransitions(activeWindow.status as MatchingWindowStatus).map(nextStatus => (
                  <TransitionButton
                    key={nextStatus}
                    toStatus={nextStatus}
                    onClick={() => setTransitionConfirm({
                      open: true,
                      windowId: activeWindow.id,
                      windowName: activeWindow.name,
                      currentStatus: activeWindow.status as MatchingWindowStatus,
                      newStatus: nextStatus,
                    })}
                    loading={updateStatus.isPending}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Window Name</p>
                <p className="text-sm font-medium">{activeWindow.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Week</p>
                <p className="text-sm font-medium">{activeWindow.target_week}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lock Date</p>
                <p className="text-sm font-medium">{formatDate(activeWindow.lock_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Close Date</p>
                <p className="text-sm font-medium">{formatDate(activeWindow.close_date)}</p>
              </div>
            </div>
            {activeWindow.notes && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                {activeWindow.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Windows Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Matching Windows</CardTitle>
          <CardDescription>View and manage matching window lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : windows?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No Matching Windows</p>
              <p className="text-sm text-muted-foreground">
                Create your first matching window to start coordinating the market.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Target Week</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Lock</TableHead>
                  <TableHead>Close</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {windows?.map(window => {
                  const status = window.status as MatchingWindowStatus;
                  const colors = MATCHING_WINDOW_STATUS_COLORS[status];
                  const allowedTransitions = getAllowedWindowTransitions(status);
                  const canEdit = status === 'upcoming';

                  return (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.name}</TableCell>
                      <TableCell>{window.target_week}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(window.start_date)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(window.lock_date)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(window.close_date)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <StatusIcon status={status} />
                          <span className="ml-1">{MATCHING_WINDOW_STATUS_LABELS[status]}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => openEditDialog(window)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {allowedTransitions.map(nextStatus => (
                            <TransitionButton
                              key={nextStatus}
                              toStatus={nextStatus}
                              onClick={() => setTransitionConfirm({
                                open: true,
                                windowId: window.id,
                                windowName: window.name,
                                currentStatus: status,
                                newStatus: nextStatus,
                              })}
                              loading={updateStatus.isPending}
                            />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Matching Window</DialogTitle>
            <DialogDescription>
              Define a new time-based matching window for market coordination.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Window Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 2025 Matching" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="target_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Week</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        {weekOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>The delivery week this window targets</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={createForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM d") : "Pick"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="lock_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Lock Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM d") : "Pick"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="close_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Close Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM d") : "Pick"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about this window..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createWindow.isPending}>
                  {createWindow.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Window
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, window: null })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Matching Window</DialogTitle>
            <DialogDescription>
              Modify window dates and details. Only upcoming windows can be edited.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Window Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="target_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Week</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        {weekOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM d") : "Pick"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="lock_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Lock Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM d") : "Pick"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="close_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Close Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM d") : "Pick"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialog({ open: false, window: null })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateWindow.isPending}>
                  {updateWindow.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transition Confirmation Dialog */}
      <AlertDialog 
        open={!!transitionConfirm} 
        onOpenChange={(open) => !open && setTransitionConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {transitionConfirm && (
                <>
                  You are about to change <strong>{transitionConfirm.windowName}</strong> from{' '}
                  <strong>{MATCHING_WINDOW_STATUS_LABELS[transitionConfirm.currentStatus]}</strong> to{' '}
                  <strong>{MATCHING_WINDOW_STATUS_LABELS[transitionConfirm.newStatus]}</strong>.
                  <br /><br />
                  {transitionConfirm.newStatus === 'active' && (
                    <>This will allow farmers and MPKs to submit batches and requests for this window.</>
                  )}
                  {transitionConfirm.newStatus === 'locked' && (
                    <>This will lock all batch and request submissions. No new changes will be accepted.</>
                  )}
                  {transitionConfirm.newStatus === 'closed' && (
                    <>This will finalize the window. All matching must be completed before closing.</>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransition} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
