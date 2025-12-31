import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  type ExecutionStatus, 
  type ExecutionRole,
  validateExecutionTransition,
} from '@/lib/execution-lifecycle';

export interface OfftakeExecution {
  id: string;
  match_id: string;
  batch_id: string;
  request_id: string;
  matched_volume: number;
  delivery_period: 'short_term' | 'mid_term' | 'long_term';
  pricing_formula_reference: string;
  reference_price_at_match: number | null;
  status: ExecutionStatus;
  
  // Scheduling
  expected_delivery_start: string | null;
  expected_delivery_end: string | null;
  delivery_location: string | null;
  scheduling_notes: string | null;
  scheduled_at: string | null;
  scheduled_by: string | null;
  
  // MPK delivery confirmation
  actual_delivery_date: string | null;
  delivered_volume: number | null;
  delivery_condition: string | null;
  mpk_delivery_notes: string | null;
  mpk_confirmed_at: string | null;
  mpk_confirmed_by: string | null;
  
  // Admin confirmation
  admin_confirmed_at: string | null;
  admin_confirmed_by: string | null;
  admin_compliance_notes: string | null;
  
  // Settlement
  settlement_reference_price: number | null;
  settlement_premiums_applied: number | null;
  settlement_indicative_total: number | null;
  settlement_calculated_at: string | null;
  settlement_notes: string | null;
  
  // Closure
  closed_at: string | null;
  closed_by: string | null;
  closure_notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface ExecutionWithDetails extends OfftakeExecution {
  batch?: {
    batch_number: string;
    region: string;
    grade: string;
    heads: number;
  };
  request?: {
    request_number: string;
    mpk_name: string;
    target_week: string;
  };
  match?: {
    heads_matched: number;
    total_price_per_kg: number | null;
    total_premium: number | null;
  };
}

export function useExecutions(filters?: { status?: ExecutionStatus; requestId?: string; batchId?: string }) {
  return useQuery({
    queryKey: ['executions', filters],
    queryFn: async () => {
      let query = supabase
        .from('offtake_executions')
        .select(`
          *,
          batches:batch_id (
            batch_number,
            region,
            grade,
            heads
          ),
          purchase_pool_requests:request_id (
            request_number,
            mpk_name,
            target_week
          ),
          pool_matches:match_id (
            heads_matched,
            total_price_per_kg,
            total_premium,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.requestId) {
        query = query.eq('request_id', filters.requestId);
      }
      if (filters?.batchId) {
        query = query.eq('batch_id', filters.batchId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching executions:', error);
        throw error;
      }

      // Debug: log raw data
      console.log('Raw executions data:', data);
      console.log('Number of executions:', data?.length || 0);

      // Map executions to include related data
      const mapped = data.map((item: any) => {
        const execution = {
          ...item,
          batch: item.batches,
          request: item.purchase_pool_requests,
          match: item.pool_matches,
        } as ExecutionWithDetails;
        
        // Debug: log each execution
        if (data.length > 0) {
          console.log('Mapped execution:', {
            id: execution.id,
            status: execution.status,
            matchStatus: execution.match?.status,
            hasMatch: !!execution.match,
            hasBatch: !!execution.batch,
            hasRequest: !!execution.request,
          });
        }
        
        return execution;
      });

      // Filter out executions where matching is cancelled (but show all others)
      // Executions are created only after matching finalization, so most should be valid
      // If match is null/undefined, still show the execution (backward compatibility or data issue)
      const filtered = mapped.filter((item: ExecutionWithDetails) => {
        // If no match data, show it anyway (might be a data issue, but don't hide it)
        if (!item.match) {
          console.warn('Execution without match data:', item.id);
          return true; // Show it anyway
        }
        
        const matchStatus = item.match.status;
        // Hide only if matching is explicitly cancelled
        const shouldShow = matchStatus !== 'cancelled';
        
        if (!shouldShow) {
          console.log('Filtered out execution:', {
            id: item.id,
            matchStatus,
            reason: 'matching is cancelled',
          });
        }
        
        return shouldShow;
      });

      if (data.length > 0) {
        console.log('Final filtered executions count:', filtered.length, 'out of', data.length);
      }
      
      return filtered;
    },
  });
}

export function useExecution(id: string | null) {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('offtake_executions')
        .select(`
          *,
          batches:batch_id (
            batch_number,
            region,
            grade,
            heads,
            avg_weight
          ),
          purchase_pool_requests:request_id (
            request_number,
            mpk_name,
            mpk_id,
            target_week,
            required_grade
          ),
          pool_matches:match_id (
            heads_matched,
            total_price_per_kg,
            base_price_per_kg,
            total_premium,
            premium_breakdown,
            status
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        batch: (data as any).batches,
        request: (data as any).purchase_pool_requests,
        match: (data as any).pool_matches,
      } as ExecutionWithDetails;
    },
    enabled: !!id,
  });
}

// Create execution from a finalized match
export function useCreateExecution() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      match_id: string;
      batch_id: string;
      request_id: string;
      matched_volume: number;
      delivery_period?: 'short_term' | 'mid_term' | 'long_term';
      reference_price_at_match?: number;
    }) => {
      const { data, error } = await supabase
        .from('offtake_executions')
        .insert({
          match_id: params.match_id,
          batch_id: params.batch_id,
          request_id: params.request_id,
          matched_volume: params.matched_volume,
          delivery_period: params.delivery_period || 'short_term',
          reference_price_at_match: params.reference_price_at_match,
          status: 'matched' as ExecutionStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data as OfftakeExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Execution created',
        description: 'Offtake execution record has been created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating execution',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Schedule delivery
export function useScheduleDelivery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      expected_delivery_start: string;
      expected_delivery_end: string;
      delivery_location?: string;
      scheduling_notes?: string;
      scheduled_by: string;
    }) => {
      const { data, error } = await supabase
        .from('offtake_executions')
        .update({
          status: 'scheduled' as ExecutionStatus,
          expected_delivery_start: params.expected_delivery_start,
          expected_delivery_end: params.expected_delivery_end,
          delivery_location: params.delivery_location || null,
          scheduling_notes: params.scheduling_notes || null,
          scheduled_at: new Date().toISOString(),
          scheduled_by: params.scheduled_by,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('execution_activity_log').insert({
        execution_id: params.id,
        action_type: 'scheduled',
        previous_status: 'matched',
        new_status: 'scheduled',
        performed_by: params.scheduled_by,
        notes: params.scheduling_notes,
      });

      return data as OfftakeExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Delivery scheduled',
        description: 'Delivery has been scheduled successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error scheduling delivery',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// MPK confirms delivery
export function useConfirmDelivery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      actual_delivery_date: string;
      delivered_volume: number;
      delivery_condition?: string;
      mpk_delivery_notes?: string;
      mpk_confirmed_by: string;
    }) => {
      const { data, error } = await supabase
        .from('offtake_executions')
        .update({
          status: 'delivered' as ExecutionStatus,
          actual_delivery_date: params.actual_delivery_date,
          delivered_volume: params.delivered_volume,
          delivery_condition: params.delivery_condition || null,
          mpk_delivery_notes: params.mpk_delivery_notes || null,
          mpk_confirmed_at: new Date().toISOString(),
          mpk_confirmed_by: params.mpk_confirmed_by,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('execution_activity_log').insert({
        execution_id: params.id,
        action_type: 'mpk_confirmed_delivery',
        previous_status: 'scheduled',
        new_status: 'delivered',
        performed_by: params.mpk_confirmed_by,
        notes: params.mpk_delivery_notes,
        metadata: {
          actual_delivery_date: params.actual_delivery_date,
          delivered_volume: params.delivered_volume,
          delivery_condition: params.delivery_condition,
        },
      });

      return data as OfftakeExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Delivery confirmed',
        description: 'Delivery has been confirmed. Awaiting admin compliance check.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error confirming delivery',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Admin confirms compliance
export function useConfirmCompliance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      admin_confirmed_by: string;
      admin_compliance_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('offtake_executions')
        .update({
          status: 'confirmed' as ExecutionStatus,
          admin_confirmed_at: new Date().toISOString(),
          admin_confirmed_by: params.admin_confirmed_by,
          admin_compliance_notes: params.admin_compliance_notes || null,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('execution_activity_log').insert({
        execution_id: params.id,
        action_type: 'admin_confirmed_compliance',
        previous_status: 'delivered',
        new_status: 'confirmed',
        performed_by: params.admin_confirmed_by,
        notes: params.admin_compliance_notes,
      });

      return data as OfftakeExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Compliance confirmed',
        description: 'Delivery compliance has been confirmed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error confirming compliance',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Calculate settlement
export function useCalculateSettlement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      settlement_reference_price: number;
      settlement_premiums_applied: number;
      settlement_notes?: string;
      performed_by: string;
    }) => {
      const indicativeTotal = params.settlement_reference_price + params.settlement_premiums_applied;

      const { data, error } = await supabase
        .from('offtake_executions')
        .update({
          status: 'settled' as ExecutionStatus,
          settlement_reference_price: params.settlement_reference_price,
          settlement_premiums_applied: params.settlement_premiums_applied,
          settlement_indicative_total: indicativeTotal,
          settlement_calculated_at: new Date().toISOString(),
          settlement_notes: params.settlement_notes || null,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('execution_activity_log').insert({
        execution_id: params.id,
        action_type: 'settlement_calculated',
        previous_status: 'confirmed',
        new_status: 'settled',
        performed_by: params.performed_by,
        notes: params.settlement_notes,
        metadata: {
          settlement_reference_price: params.settlement_reference_price,
          settlement_premiums_applied: params.settlement_premiums_applied,
          settlement_indicative_total: indicativeTotal,
        },
      });

      return data as OfftakeExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Settlement calculated',
        description: 'Indicative settlement has been calculated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error calculating settlement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Close execution
export function useCloseExecution() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      closed_by: string;
      closure_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('offtake_executions')
        .update({
          status: 'closed' as ExecutionStatus,
          closed_at: new Date().toISOString(),
          closed_by: params.closed_by,
          closure_notes: params.closure_notes || null,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('execution_activity_log').insert({
        execution_id: params.id,
        action_type: 'closed',
        previous_status: 'settled',
        new_status: 'closed',
        performed_by: params.closed_by,
        notes: params.closure_notes,
      });

      return data as OfftakeExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Execution closed',
        description: 'The execution has been closed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error closing execution',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Transition status with FSM validation
export function useTransitionExecutionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      fromStatus: ExecutionStatus;
      toStatus: ExecutionStatus;
      role: ExecutionRole;
      performed_by: string;
      notes?: string;
    }) => {
      // Validate transition
      const validation = validateExecutionTransition(params.fromStatus, params.toStatus, params.role);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase
        .from('offtake_executions')
        .update({ status: params.toStatus })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('execution_activity_log').insert({
        execution_id: params.id,
        action_type: 'status_transition',
        previous_status: params.fromStatus,
        new_status: params.toStatus,
        performed_by: params.performed_by,
        notes: params.notes,
      });

      return data as OfftakeExecution;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast({
        title: 'Status updated',
        description: `Execution status changed to ${variables.toStatus}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Transition blocked',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Get execution activity log
export function useExecutionActivityLog(executionId: string | null) {
  return useQuery({
    queryKey: ['execution-activity-log', executionId],
    queryFn: async () => {
      if (!executionId) return [];
      
      const { data, error } = await supabase
        .from('execution_activity_log')
        .select('*')
        .eq('execution_id', executionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!executionId,
  });
}
