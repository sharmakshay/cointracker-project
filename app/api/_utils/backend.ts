export function getBackendBaseUrl(): string {
	// Prefer server-only env var if provided, otherwise fall back to public for convenience
	return (
		process.env.BACKEND_API_URL ||
		process.env.NEXT_PUBLIC_API_URL ||
		"http://localhost:3001"
	);
}

export async function forwardRequest(path: string, init?: RequestInit) {
	const baseUrl = getBackendBaseUrl();
	const url = `${baseUrl}${path}`;
	return fetch(url, {
		// Ensure we don't cache proxied responses unless the backend sets it
		cache: "no-store",
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers || {}),
		},
	});
}
