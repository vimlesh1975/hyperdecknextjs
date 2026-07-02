import { NextResponse } from "next/server";
import { resolveUrl } from "@/lib/hyperdeck";

export async function POST(req) {
  try {
    const { source } = await req.json();
    const allowed = ["SDI", "HDMI"];

    if (!source || !allowed.includes(source)) {
      return NextResponse.json(
        { error: "Invalid or missing source. Allowed: " + allowed.join(", ") },
        { status: 400 }
      );
    }

    const url = resolveUrl(req, "/transports/0/inputVideoSource");
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputVideoSource: source }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `HyperDeck returned ${response.status}`, details: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok", inputVideoSource: source });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

