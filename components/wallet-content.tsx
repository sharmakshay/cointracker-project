"use client";

import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PaginatedTransactionsResponse, Wallet } from "@/lib/api-client";
import {
	useInfiniteWalletTransactions,
	useSyncWallet,
} from "@/lib/queries/wallet-queries";
import { Button } from "./ui/button";

const truncateAddress = (address: string) => {
	if (address.length <= 13) return address;
	return `${address.slice(0, address.startsWith("0x") ? 6 : 4)}...${address.slice(-5)}`;
};

const PAGE_SIZE = 20;

type WalletContentProps = {
	wallet: Wallet;
};

export function WalletContent({ wallet }: WalletContentProps) {
	const [isCopied, setIsCopied] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteWalletTransactions(wallet.id, PAGE_SIZE);
	const syncWalletMutation = useSyncWallet();

	useEffect(() => {
		const el = loadMoreRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const handleSync = async () => {
		try {
			await syncWalletMutation.mutateAsync(wallet.id);
			toast.success("Wallet synced successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to sync wallet",
			);
		}
	};

	const copyAddress = async () => {
		try {
			await navigator.clipboard.writeText(wallet.address);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy address:", err);
		}
	};

	// Flatten pages
	const transactions =
		(data?.pages as PaginatedTransactionsResponse[] | undefined)?.flatMap(
			(p) => p.items,
		) ?? [];
	const stableTotalBalance =
		(data?.pages?.[0] as PaginatedTransactionsResponse | undefined)
			?.totalBalance ?? 0;

	return (
		<div
			className="flex-1 flex flex-col"
			style={{ backgroundColor: "#fcfcfc" }}
		>
			{/* Header */}
			<div className="p-8 pb-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold" style={{ color: "#202020" }}>
							{wallet.name}
						</h1>
						<span className="text-base" style={{ color: "#838383" }}>
							{truncateAddress(wallet.address)}
						</span>
						<button
							type="button"
							onClick={copyAddress}
							className="p-1 hover:opacity-60 transition-opacity"
							title={isCopied ? "Copied!" : "Copy address"}
						>
							{isCopied ? (
								<Check className="w-4 h-4" style={{ color: "#3ea44b" }} />
							) : (
								<Copy className="w-4 h-4" style={{ color: "#838383" }} />
							)}
						</button>
					</div>
					<div className="flex gap-3">
						<Button
							onClick={handleSync}
							disabled={syncWalletMutation.isPending}
							className="rounded-full px-6 text-white font-medium"
							style={{ backgroundColor: "#8c8fff" }}
						>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${syncWalletMutation.isPending ? "animate-spin" : ""}`}
							/>
							{syncWalletMutation.isPending ? "Syncing..." : "Sync"}
						</Button>
						<Button
							variant="outline"
							className="rounded-full px-6 font-medium bg-transparent"
							style={{ borderColor: "#F0F0F0", color: "#202020" }}
						>
							<Pencil className="w-4 h-4 mr-2" />
							Edit
						</Button>
					</div>
				</div>

				<div className="text-5xl font-bold mb-8" style={{ color: "#202020" }}>
					$
					{stableTotalBalance.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</div>

				<h2 className="text-sm font-medium" style={{ color: "#838383" }}>
					Transactions
				</h2>
			</div>

			{/* Transactions List */}
			<div className="flex-1 overflow-y-auto px-8">
				<div className="space-y-3 pb-8">
					{isLoading ? (
						<div className="flex justify-center py-8">
							<div
								className="animate-spin rounded-full h-8 w-8 border-b-2"
								style={{ borderColor: "#8c8fff" }}
							></div>
						</div>
					) : error ? (
						<div className="text-center py-8">
							<div className="text-red-600 text-xl mb-2">⚠️</div>
							<p className="text-red-600 mb-2">Failed to load transactions</p>
							<p className="text-gray-600 text-sm">{error.message}</p>
						</div>
					) : transactions.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-gray-400 text-4xl mb-4">📄</div>
							<p className="text-gray-600 mb-2">No transactions found</p>
							<p className="text-gray-500 text-sm">
								Sync your wallet to see transactions
							</p>
						</div>
					) : (
						<>
							{transactions.map((transaction) => {
								const isPositive = transaction.balance > 0;
								const transactionDate = new Date(
									transaction.date,
								).toLocaleDateString();

								return (
									<div
										key={transaction.id}
										className="flex items-center justify-between p-4 rounded-xl"
										style={{ backgroundColor: "#ffffff" }}
									>
										<div className="flex items-center gap-4 flex-1">
											<span className="text-sm" style={{ color: "#202020" }}>
												Transaction {transaction.id.slice(0, 8)}...
											</span>
											<span
												className="px-3 py-1 rounded-md text-xs font-medium"
												style={{
													backgroundColor: isPositive ? "#e2fbe8" : "#fae3e3",
													color: isPositive ? "#3ea44b" : "#d42422",
												}}
											>
												{isPositive ? "Received" : "Sent"}
											</span>
											<span className="text-sm" style={{ color: "#838383" }}>
												{transactionDate}
											</span>
											<span className="text-sm" style={{ color: "#838383" }}>
												{transaction.confirmations} confirmations
											</span>
										</div>
										<span
											className="text-sm font-medium"
											style={{
												color: isPositive ? "#3ea44b" : "#d42422",
											}}
										>
											{isPositive ? "+" : ""}$
											{transaction.balance.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
								);
							})}

							{/* Sentinel for infinite scroll */}
							{hasNextPage && <div ref={loadMoreRef} className="h-8" />}
							{isFetchingNextPage && (
								<div className="flex justify-center py-4">
									<div
										className="animate-spin rounded-full h-8 w-8 border-b-2"
										style={{ borderColor: "#8c8fff" }}
									></div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
