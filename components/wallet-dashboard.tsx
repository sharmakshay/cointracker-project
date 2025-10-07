"use client";

import { useEffect, useState } from "react";
import type { Wallet } from "@/lib/api-client";
import { useWallets } from "@/lib/queries/wallet-queries";
import { WalletContent } from "./wallet-content";
import { WalletSidebar } from "./wallet-sidebar";

export default function WalletDashboard() {
	const { data: wallets = [], isLoading, error } = useWallets();
	const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

	// Set the first wallet as selected when wallets are loaded
	useEffect(() => {
		if (wallets.length > 0 && !selectedWallet) {
			setSelectedWallet(wallets[0]);
		}
	}, [wallets, selectedWallet]);

	// Handle loading state
	if (isLoading) {
		return (
			<div
				className="flex h-screen items-center justify-center"
				style={{ backgroundColor: "#fcfcfc" }}
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading wallets...</p>
				</div>
			</div>
		);
	}

	// Handle error state
	if (error) {
		return (
			<div
				className="flex h-screen items-center justify-center"
				style={{ backgroundColor: "#fcfcfc" }}
			>
				<div className="text-center">
					<div className="text-red-600 text-xl mb-4">⚠️</div>
					<p className="text-red-600 mb-2">Failed to load wallets</p>
					<p className="text-gray-600 text-sm">{error.message}</p>
				</div>
			</div>
		);
	}

	// Handle empty state
	if (wallets.length === 0) {
		return (
			<div
				className="flex h-screen items-center justify-center"
				style={{ backgroundColor: "#fcfcfc" }}
			>
				<div className="text-center">
					<div className="text-gray-400 text-4xl mb-4">💼</div>
					<p className="text-gray-600 mb-2">No wallets found</p>
					<p className="text-gray-500 text-sm">Add a wallet to get started</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen" style={{ backgroundColor: "#fcfcfc" }}>
			<WalletSidebar
				wallets={wallets}
				selectedWallet={selectedWallet}
				onSelectWallet={setSelectedWallet}
			/>
			{selectedWallet && <WalletContent wallet={selectedWallet} />}
		</div>
	);
}
