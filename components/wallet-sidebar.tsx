"use client";

import { Plus, Trash2, WalletIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Wallet } from "@/lib/api-client";
import { useCreateWallet, useDeleteWallet } from "@/lib/queries/wallet-queries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type WalletSidebarProps = {
	wallets: Wallet[];
	selectedWallet: Wallet | null;
	onSelectWallet: (wallet: Wallet) => void;
};

const truncateAddress = (address: string) => {
	if (address.length <= 13) return address;
	return `${address.slice(0, address.startsWith("0x") ? 6 : 4)}...${address.slice(-5)}`;
};

export function WalletSidebar({
	wallets,
	selectedWallet,
	onSelectWallet,
}: WalletSidebarProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [newWalletAddress, setNewWalletAddress] = useState("");

	const createWalletMutation = useCreateWallet();
	const deleteWalletMutation = useDeleteWallet();

	const handleSave = async () => {
		if (newWalletAddress.trim()) {
			try {
				await createWalletMutation.mutateAsync({
					address: newWalletAddress.trim(),
				});
				toast.success("Wallet added successfully");
				setNewWalletAddress("");
				setIsAdding(false);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to add wallet",
				);
			}
		}
	};

	const handleDeleteWallet = async (
		walletId: string,
		event: React.MouseEvent,
	) => {
		event.stopPropagation();
		try {
			await deleteWalletMutation.mutateAsync(walletId);
			toast.success("Wallet deleted successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete wallet",
			);
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
				<div key={wallet.id} className="relative group">
					<button
						type="button"
						onClick={() => onSelectWallet(wallet)}
						className="flex items-center gap-3 p-4 rounded-2xl transition-colors hover:opacity-80 w-full"
						style={{
							backgroundColor:
								selectedWallet?.id === wallet.id ? "#f7f7ff" : "#f9f9f9",
						}}
					>
						<div
							className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
							style={{ backgroundColor: "#8c8fff" }}
						>
							{wallet.name.charAt(0).toUpperCase()}
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
					<button
						type="button"
						onClick={(e) => handleDeleteWallet(wallet.id, e)}
						className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100"
						title="Delete wallet"
					>
						<Trash2 className="w-4 h-4 text-red-500" />
					</button>
				</div>
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
						disabled={
							!newWalletAddress.trim() || createWalletMutation.isPending
						}
						className="flex-1 rounded-2xl py-6 text-white font-medium"
						style={{ backgroundColor: "#8c8fff" }}
					>
						{createWalletMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</div>
			)}
		</div>
	);
}
