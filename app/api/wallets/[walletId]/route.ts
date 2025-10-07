import { forwardRequest } from "@/app/api/_utils/backend";

export async function GET(
	_: Request,
	context: { params: Promise<{ walletId: string }> },
) {
	const { walletId } = await context.params;
	const res = await forwardRequest(`/wallets/${walletId}`);
	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
}

export async function DELETE(
	_: Request,
	context: { params: Promise<{ walletId: string }> },
) {
	const { walletId } = await context.params;
	const res = await forwardRequest(`/wallets/${walletId}`, {
		method: "DELETE",
	});
	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
}
