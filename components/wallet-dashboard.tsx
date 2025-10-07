"use client";

import { useState } from "react";
import { WalletContent } from "./wallet-content";
import { WalletSidebar } from "./wallet-sidebar";

export type Wallet = {
	id: string;
	name: string;
	address: string;
	icon: string;
	color: string;
};

export default function WalletDashboard() {
	const [wallets, setWallets] = useState<Wallet[]>([
		{
			id: "1",
			name: "Coinbase",
			address: "0xcC6a9b3e8f2d4c1a7b5e9f3d2c8a4b6e1f7d9c5a225",
			icon: "coinbase",
			color: "#0354ff",
		},
		{
			id: "2",
			name: "Kraken",
			address: "Hbd8x9y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0FRn4l",
			icon: "kraken",
			color: "#5b3ed6",
		},
		{
			id: "3",
			name: "Phantom",
			address: "3Rh0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u2Agl4o",
			icon: "phantom",
			color: "#ab9ff2",
		},
	]);

	const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets[0]);

	const handleAddWallet = (wallet: Wallet) => {
		setWallets([...wallets, wallet]);
	};

	return (
		<div className="flex h-screen" style={{ backgroundColor: "#fcfcfc" }}>
			<WalletSidebar
				wallets={wallets}
				selectedWallet={selectedWallet}
				onSelectWallet={setSelectedWallet}
				onAddWallet={handleAddWallet}
			/>
			<WalletContent wallet={selectedWallet} />
		</div>
	);
}
