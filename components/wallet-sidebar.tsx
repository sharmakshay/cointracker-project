"use client";

import { Plus, WalletIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { Wallet } from "./wallet-dashboard";

type WalletSidebarProps = {
	wallets: Wallet[];
	selectedWallet: Wallet;
	onSelectWallet: (wallet: Wallet) => void;
	onAddWallet: (wallet: Wallet) => void;
};

const truncateAddress = (address: string) => {
	if (address.length <= 13) return address;
	return `${address.slice(0, address.startsWith("0x") ? 6 : 4)}...${address.slice(-5)}`;
};

export function WalletSidebar({
	wallets,
	selectedWallet,
	onSelectWallet,
	onAddWallet,
}: WalletSidebarProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [newWalletAddress, setNewWalletAddress] = useState("");

	const handleSave = () => {
		if (newWalletAddress) {
			const newWallet: Wallet = {
				id: Date.now().toString(),
				name: "Wallet",
				address: newWalletAddress,
				icon: "generic",
				color: "#8c8fff",
			};
			onAddWallet(newWallet);
			setNewWalletAddress("");
			setIsAdding(false);
		}
	};

	const handleCancel = () => {
		setNewWalletAddress("");
		setIsAdding(false);
	};

	return (
		<div
			className="w-80 p-6 flex flex-col gap-4"
			style={{ backgroundColor: "#ffffff" }}
		>
			{wallets.map((wallet) => (
				<button
					type="button"
					key={wallet.id}
					onClick={() => onSelectWallet(wallet)}
					className="flex items-center gap-3 p-4 rounded-2xl transition-colors hover:opacity-80"
					style={{
						backgroundColor:
							selectedWallet.id === wallet.id ? "#f7f7ff" : "#f9f9f9",
					}}
				>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
						style={{ backgroundColor: wallet.color }}
					>
						{wallet.name.charAt(0)}
					</div>
					<div className="flex-1 text-left">
						<div className="font-medium text-sm" style={{ color: "#202020" }}>
							{wallet.name}
						</div>
						<div className="text-xs" style={{ color: "#838383" }}>
							{truncateAddress(wallet.address)}
						</div>
					</div>
				</button>
			))}

			{isAdding && (
				<div
					className="flex items-center gap-3 p-4 rounded-2xl"
					style={{ backgroundColor: "#f7f7ff" }}
				>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
						style={{ backgroundColor: "#8c8fff" }}
					>
						<WalletIcon className="w-5 h-5 text-white" />
					</div>
					<div className="flex-1">
						<Input
							placeholder="Enter wallet address"
							value={newWalletAddress}
							onChange={(e) => setNewWalletAddress(e.target.value)}
							className="border-0 h-8 px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
							style={{ backgroundColor: "transparent", color: "#202020" }}
						/>
					</div>
				</div>
			)}

			{!isAdding ? (
				<Button
					onClick={() => setIsAdding(true)}
					className="w-full rounded-2xl py-6 text-white font-medium"
					style={{ backgroundColor: "#8c8fff" }}
				>
					<Plus className="w-5 h-5 mr-2" />
					Add another wallet
				</Button>
			) : (
				<div className="flex gap-2">
					<Button
						onClick={handleCancel}
						variant="outline"
						className="flex-1 rounded-2xl py-6 font-medium border-0 bg-transparent"
						style={{ backgroundColor: "#f0f0f0", color: "#646464" }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						className="flex-1 rounded-2xl py-6 text-white font-medium"
						style={{ backgroundColor: "#8c8fff" }}
					>
						Save
					</Button>
				</div>
			)}
		</div>
	);
}
