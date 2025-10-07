import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Consider data stale after 5 minutes
			staleTime: 5 * 60 * 1000,
			// Keep unused data for 10 minutes
			gcTime: 10 * 60 * 1000,
			// Retry failed requests up to 3 times
			retry: 3,
			// Don't refetch on window focus by default
			refetchOnWindowFocus: false,
		},
		mutations: {
			// Retry failed mutations once
			retry: 1,
		},
	},
});
