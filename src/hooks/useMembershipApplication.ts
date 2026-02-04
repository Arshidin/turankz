import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { MembershipApplicationPayload } from '@/lib/membership-validation';

export interface MembershipApplicationResult {
  id: string;
  application_number: string;
  created_at: string;
}

/**
 * Submit a new membership application
 * This can be used without authentication (public form)
 */
export const useMembershipApplication = () => {
  return useMutation<MembershipApplicationResult, Error, MembershipApplicationPayload>({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('membership_applications')
        .insert([data])
        .select('id, application_number, created_at')
        .single();

      if (error) {
        logger.error('Failed to submit membership application', error, {
          action: 'submitMembershipApplication'
        });
        throw new Error(error.message);
      }

      return result as MembershipApplicationResult;
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive',
      });
    },
  });
};
