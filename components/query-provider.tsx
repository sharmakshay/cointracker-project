"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";

interface QueryProviderProps {
	children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	// Create a stable query client instance
	const [client] = useState(() => queryClient);

	return (
		<QueryClientProvider client={client}>
			{children}
			<Toaster position="top-right" />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
