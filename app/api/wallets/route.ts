import { forwardRequest } from "@/app/api/_utils/backend";

export async function GET() {
	const res = await forwardRequest("/wallets");
	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
}

export async function POST(request: Request) {
	const data = await request.json().catch(() => ({}));
	const res = await forwardRequest("/wallets", {
		method: "POST",
		body: JSON.stringify(data),
	});
	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
}
