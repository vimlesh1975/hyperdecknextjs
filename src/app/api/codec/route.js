import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/hyperdeck";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/system/codecFormat`);
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `HyperDeck returned ${response.status}`, details: text },
        { status: 500 }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { codec, container } = await req.json();

    if (!codec) {
      return NextResponse.json(
        { error: "codec is required" },
        { status: 400 }
      );
    }

    const body = container ? { codec, container } : { codec };

    const response = await fetch(`${BASE_URL}/system/codecFormat`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `HyperDeck returned ${response.status}`, details: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok", set: body });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
