// API Client for wallet operations
const API_BASE_URL = ""; // Use Next.js API routes as proxy

export interface Wallet {
	id: string;
	address: string;
	name: string;
	iconURL: string;
}

export interface Transaction {
	id: string;
	walletId: string;
	date: string;
	balance: number;
	confirmations: number;
}

export interface CreateWalletRequest {
	address: string;
}

export interface ApiError {
	error: string;
}

export interface PaginatedTransactionsResponse {
	items: Transaction[];
	nextCursor: string | null;
	totalBalance: number;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const config: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				const errorData: ApiError = await response
					.json()
					.catch(() => ({ error: "Unknown error" }));
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Network error occurred");
		}
	}

	// GET /wallets - List all wallets
	async getWallets(): Promise<Wallet[]> {
		return this.request<Wallet[]>("/api/wallets");
	}

	// GET /wallets/:walletId - Get wallet transactions (full list)
	async getWalletTransactions(walletId: string): Promise<Transaction[]> {
		return this.request<Transaction[]>(`/api/wallets/${walletId}`);
	}

	// GET /wallets/:walletId with pagination
	async getWalletTransactionsPage(
		walletId: string,
		params: { cursor?: string | null; limit?: number } = {},
	): Promise<PaginatedTransactionsResponse> {
		const qs = new URLSearchParams();
		if (params.cursor) qs.set("cursor", params.cursor);
		if (params.limit) qs.set("limit", String(params.limit));
		const suffix = qs.toString() ? `?${qs.toString()}` : "";
		return this.request<PaginatedTransactionsResponse>(
			`/api/wallets/${walletId}${suffix}`,
		);
	}

	// POST /wallets - Create new wallet
	async createWallet(data: CreateWalletRequest): Promise<Wallet[]> {
		return this.request<Wallet[]>("/api/wallets", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// POST /wallets/:walletId/sync - Sync wallet
	async syncWallet(walletId: string): Promise<Transaction[]> {
		return this.request<Transaction[]>(`/api/wallets/${walletId}/sync`, {
			method: "POST",
		});
	}

	// DELETE /wallets/:walletId - Delete wallet
	async deleteWallet(walletId: string): Promise<{ message: string }> {
		return this.request<{ message: string }>(`/api/wallets/${walletId}`, {
			method: "DELETE",
		});
	}
}

export const apiClient = new ApiClient();
