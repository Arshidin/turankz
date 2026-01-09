import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Use vi.hoisted to create mocks that can be referenced in vi.mock factories
const { mockAuthContext, mockFrom } = vi.hoisted(() => ({
  mockAuthContext: {
    user: { id: 'test-user-id' } as { id: string } | null,
    role: 'farmer' as 'farmer' | 'admin' | 'mpk',
    registrationStatus: 'active' as string,
    session: null,
    isLoading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    assignRole: vi.fn(),
    refetchRole: vi.fn(),
  },
  mockFrom: vi.fn(),
}));

// Mock modules using hoisted variables
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

// Import after mocks
import { useCurrentFarmer, useFarmerGrading, useIsObserver, useCanCreateBatches } from '../useCurrentFarmer';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCurrentFarmer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = { id: 'test-user-id' };
    mockAuthContext.role = 'farmer';
    mockAuthContext.registrationStatus = 'active';
  });

  it('should return null when user is not logged in', async () => {
    mockAuthContext.user = null;

    const { result } = renderHook(() => useCurrentFarmer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });
  });

  it('should return null when user role is not farmer', async () => {
    mockAuthContext.role = 'admin';

    const { result } = renderHook(() => useCurrentFarmer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });
  });

  it('should fetch farmer data correctly', async () => {
    const mockFarmer = {
      id: 'farmer-1',
      user_id: 'test-user-id',
      name: 'Test Farmer',
      grading: 'standard_supplier',
      region: 'Almaty',
    };

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockFarmer, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useCurrentFarmer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockFarmer);
    expect(mockFrom).toHaveBeenCalledWith('farmers');
  });

  it('should handle fetch errors', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Fetch failed')
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCurrentFarmer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useFarmerGrading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = { id: 'test-user-id' };
    mockAuthContext.role = 'farmer';
  });

  it('should return null when no farmer data', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useFarmerGrading(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('should return correct grading for observer', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'observer' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useFarmerGrading(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe('observer');
    });
  });

  it('should return correct grading for declared_supplier', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'declared_supplier' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useFarmerGrading(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe('declared_supplier');
    });
  });

  it('should return correct grading for standard_supplier', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'standard_supplier' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useFarmerGrading(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe('standard_supplier');
    });
  });
});

describe('useIsObserver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = { id: 'test-user-id' };
    mockAuthContext.role = 'farmer';
  });

  it('should return false for non-farmer roles', () => {
    mockAuthContext.role = 'admin';

    const { result } = renderHook(() => useIsObserver(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isObserver).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return true for observer grading', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'observer' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useIsObserver(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isObserver).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return false for declared_supplier grading', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'declared_supplier' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useIsObserver(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isObserver).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('useCanCreateBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = { id: 'test-user-id' };
    mockAuthContext.role = 'farmer';
    mockAuthContext.registrationStatus = 'active';
  });

  it('should return false for non-farmer roles', () => {
    mockAuthContext.role = 'mpk';

    const { result } = renderHook(() => useCanCreateBatches(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });

  it('should return false when registration is not active', async () => {
    mockAuthContext.registrationStatus = 'pending';

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'standard_supplier' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCanCreateBatches(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });

  it('should return false for observer grading', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'observer' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCanCreateBatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true for declared_supplier grading', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'declared_supplier' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCanCreateBatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return true for standard_supplier grading', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { grading: 'standard_supplier' },
            error: null
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCanCreateBatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
