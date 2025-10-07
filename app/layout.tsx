import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "CoinTracker Wallets",
	description: "Wallet Dashboard",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
				suppressHydrationWarning
			>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
