"use client";

import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import type { Wallet } from "./wallet-dashboard";

type Transaction = {
	id: string;
	address: string;
	type: "received" | "sent";
	date: string;
	confirmations: number;
	amount: string;
};

const truncateAddress = (address: string) => {
	if (address.length <= 13) return address;
	return `${address.slice(0, address.startsWith("0x") ? 6 : 4)}...${address.slice(-5)}`;
};

// Generate mock transactions
const generateTransactions = (
	count: number,
	startId: number,
): Transaction[] => {
	return Array.from({ length: count }, (_, i) => ({
		id: `${startId + i}`,
		address: "0xcC6a9b3e8f2d4c1a7b5e9f3d2c8a4b6e1f7d9c5a225",
		type: (startId + i) % 3 === 0 ? "sent" : "received", // Deterministic based on ID
		date: "2024-01-15",
		confirmations: 6,
		amount: "0.5",
	}));
};

type WalletContentProps = {
	wallet: Wallet;
};

export function WalletContent({ wallet }: WalletContentProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [isCopied, setIsCopied] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const observerTarget = useRef<HTMLDivElement>(null);

	const loadMoreTransactions = useCallback(() => {
		if (isLoading || !hasMore) return;

		setIsLoading(true);
		// Simulate API call
		setTimeout(() => {
			const newTransactions = generateTransactions(20, transactions.length);
			setTransactions((prev) => [...prev, ...newTransactions]);
			setIsLoading(false);

			// Stop loading after 100 transactions for demo
			if (transactions.length >= 80) {
				setHasMore(false);
			}
		}, 1000);
	}, [isLoading, hasMore, transactions.length]);

	// Initialize transactions on client side to avoid hydration issues
	useEffect(() => {
		if (!isInitialized) {
			setTransactions(generateTransactions(20, 0));
			setIsInitialized(true);
		}
	}, [isInitialized]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMoreTransactions();
				}
			},
			{ threshold: 0.1 },
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [loadMoreTransactions, hasMore, isLoading]);

	const copyAddress = async () => {
		try {
			await navigator.clipboard.writeText(wallet.address);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy address:", err);
		}
	};

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
							className="rounded-full px-6 text-white font-medium"
							style={{ backgroundColor: "#8c8fff" }}
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Sync
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
					$15,781.66
				</div>

				<h2 className="text-sm font-medium" style={{ color: "#838383" }}>
					Transactions
				</h2>
			</div>

			{/* Transactions List */}
			<div className="flex-1 overflow-y-auto px-8">
				<div className="space-y-3 pb-8">
					{!isInitialized ? (
						<div className="flex justify-center py-8">
							<div
								className="animate-spin rounded-full h-8 w-8 border-b-2"
								style={{ borderColor: "#8c8fff" }}
							></div>
						</div>
					) : (
						transactions.map((transaction) => (
							<div
								key={transaction.id}
								className="flex items-center justify-between p-4 rounded-xl"
								style={{ backgroundColor: "#ffffff" }}
							>
								<div className="flex items-center gap-4 flex-1">
									<span className="text-sm" style={{ color: "#202020" }}>
										{truncateAddress(transaction.address)}
									</span>
									<span
										className="px-3 py-1 rounded-md text-xs font-medium"
										style={{
											backgroundColor:
												transaction.type === "received" ? "#e2fbe8" : "#fae3e3",
											color:
												transaction.type === "received" ? "#3ea44b" : "#d42422",
										}}
									>
										{transaction.type === "received" ? "Received" : "Sent"}
									</span>
									<span className="text-sm" style={{ color: "#838383" }}>
										{transaction.date}
									</span>
									<span className="text-sm" style={{ color: "#838383" }}>
										{transaction.confirmations} confirmations
									</span>
								</div>
								<span
									className="text-sm font-medium"
									style={{
										color:
											transaction.type === "received" ? "#3ea44b" : "#d42422",
									}}
								>
									{transaction.type === "received" ? "+" : "-"}{" "}
									{transaction.amount} BTC
								</span>
							</div>
						))
					)}

					{/* Loading indicator */}
					{isLoading && (
						<div className="flex justify-center py-4">
							<div
								className="animate-spin rounded-full h-8 w-8 border-b-2"
								style={{ borderColor: "#8c8fff" }}
							></div>
						</div>
					)}

					{/* Intersection observer target */}
					{isInitialized && <div ref={observerTarget} className="h-4" />}

					{!hasMore && isInitialized && (
						<div
							className="text-center py-4 text-sm"
							style={{ color: "#838383" }}
						>
							No more transactions
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
