import { forwardRequest } from "@/app/api/_utils/backend";

export async function GET(
	request: Request,
	context: { params: Promise<{ walletId: string }> },
) {
	const { walletId } = await context.params;
	const { searchParams } = new URL(request.url);
	const cursor = searchParams.get("cursor");
	const limit = searchParams.get("limit");
	const qs = new URLSearchParams();
	if (cursor) qs.set("cursor", cursor);
	if (limit) qs.set("limit", limit);
	const path = qs.toString()
		? `/wallets/${walletId}?${qs.toString()}`
		: `/wallets/${walletId}`;
	const res = await forwardRequest(path);
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
