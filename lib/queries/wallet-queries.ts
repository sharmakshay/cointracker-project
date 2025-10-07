import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	PaginatedTransactionsResponse,
	Transaction,
	Wallet,
} from "../api-client";
import { apiClient, type CreateWalletRequest } from "../api-client";

// Query keys for consistent cache management
export const walletKeys = {
	all: ["wallets"] as const,
	lists: () => [...walletKeys.all, "list"] as const,
	list: () => [...walletKeys.lists()] as const,
	details: () => [...walletKeys.all, "detail"] as const,
	detail: (id: string) => [...walletKeys.details(), id] as const,
	transactions: (walletId: string) =>
		[...walletKeys.detail(walletId), "transactions"] as const,
	transactionsInfinite: (walletId: string) =>
		[...walletKeys.detail(walletId), "transactions-infinite"] as const,
};

// GET /wallets - List all wallets
export function useWallets() {
	return useQuery({
		queryKey: walletKeys.list(),
		queryFn: () => apiClient.getWallets(),
	});
}

// GET /wallets/:walletId - Get wallet transactions
export function useWalletTransactions(walletId: string) {
	return useQuery({
		queryKey: walletKeys.transactions(walletId),
		queryFn: () => apiClient.getWalletTransactions(walletId),
		enabled: !!walletId,
		select: (txs: Transaction[]) =>
			[...txs].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
	});
}

// Infinite transactions
export function useInfiniteWalletTransactions(walletId: string, pageSize = 20) {
	return useInfiniteQuery<PaginatedTransactionsResponse, Error>({
		queryKey: walletKeys.transactionsInfinite(walletId),
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) =>
			apiClient.getWalletTransactionsPage(walletId, {
				cursor: (pageParam as string | null) ?? null,
				limit: pageSize,
			}),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: !!walletId,
	});
}

// POST /wallets - Create new wallet
export function useCreateWallet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWalletRequest) => apiClient.createWallet(data),
		onSuccess: () => {
			// Invalidate and refetch wallets list
			queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to create wallet:", error);
		},
	});
}

// POST /wallets/:walletId/sync - Sync wallet
export function useSyncWallet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (walletId: string) => apiClient.syncWallet(walletId),
		onSuccess: (newTransactions, walletId) => {
			// Update the transactions cache for this wallet: only add new items
			queryClient.setQueryData(
				walletKeys.transactions(walletId),
				(oldTransactions: Transaction[] | undefined) => {
					const existing = oldTransactions ?? [];
					if (newTransactions.length === 0) return existing;
					const existingIds = new Set(existing.map((t) => t.id));
					const dedupedNew = newTransactions.filter(
						(t) => !existingIds.has(t.id),
					);
					if (dedupedNew.length === 0) return existing;
					const merged = [...existing, ...dedupedNew];
					return merged.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
				},
			);

			// Invalidate infinite query to refetch first page so new items appear at top
			queryClient.invalidateQueries({
				queryKey: walletKeys.transactionsInfinite(walletId),
			});
		},
		onError: (error) => {
			console.error("Failed to sync wallet:", error);
		},
	});
}

// DELETE /wallets/:walletId - Delete wallet
export function useDeleteWallet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (walletId: string) => apiClient.deleteWallet(walletId),
		onSuccess: (_, walletId) => {
			// Remove wallet from cache
			queryClient.setQueryData(
				walletKeys.list(),
				(oldWallets: Wallet[] | undefined) => {
					if (!oldWallets) return [];
					return oldWallets.filter((wallet: Wallet) => wallet.id !== walletId);
				},
			);

			// Remove transactions cache for this wallet
			queryClient.removeQueries({
				queryKey: walletKeys.transactions(walletId),
			});
			queryClient.removeQueries({
				queryKey: walletKeys.transactionsInfinite(walletId),
			});

			// Remove wallet detail cache
			queryClient.removeQueries({ queryKey: walletKeys.detail(walletId) });
		},
		onError: (error) => {
			console.error("Failed to delete wallet:", error);
		},
	});
}
