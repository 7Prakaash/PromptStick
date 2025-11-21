import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient for React Query
 * Currently used for client-side state management
 * Ready for future Supabase integration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
