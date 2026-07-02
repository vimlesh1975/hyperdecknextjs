import { NextResponse } from "next/server";
import { resolveUrl } from "@/lib/hyperdeck";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const url = resolveUrl(req, "/clips");
    const resp = await fetch(url, { cache: "no-store" });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


