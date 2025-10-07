import { forwardRequest } from "@/app/api/_utils/backend";

export async function POST(
	_: Request,
	context: { params: Promise<{ walletId: string }> },
) {
	const { walletId } = await context.params;
	const res = await forwardRequest(`/wallets/${walletId}/sync`, {
		method: "POST",
	});
	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
}
