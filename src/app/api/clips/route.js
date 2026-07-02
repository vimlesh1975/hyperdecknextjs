import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/hyperdeck";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resp = await fetch(`${BASE_URL}/clips`, { cache: "no-store" });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

