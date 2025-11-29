import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/hyperdeck";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path || !path.startsWith("/")) {
      return NextResponse.json(
        { error: "Query 'path' is required and must start with '/'" },
        { status: 400 }
      );
    }

    const url = `${BASE_URL}${path}`;
    const response = await fetch(url);
    const text = await response.text();

    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text || null;
    }

    return NextResponse.json({
      url,
      status: response.status,
      ok: response.ok,
      body,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
