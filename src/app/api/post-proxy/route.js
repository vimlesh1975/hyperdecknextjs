import { NextResponse } from "next/server";
import { resolveUrl } from "@/lib/hyperdeck";

export async function POST(req) {
  try {
    const { path, method = "POST", body } = (await req.json()) || {};

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "Field 'path' is required" },
        { status: 400 }
      );
    }

    if (!path.startsWith("/")) {
      return NextResponse.json(
        { error: "Path must start with '/'" },
        { status: 400 }
      );
    }

    const upperMethod = String(method).toUpperCase();
    const allowedMethods = ["POST", "PUT"];
    if (!allowedMethods.includes(upperMethod)) {
      return NextResponse.json(
        { error: "Method must be POST or PUT", method: upperMethod },
        { status: 400 }
      );
    }

    const url = resolveUrl(req, path);

    const fetchOptions = { method: upperMethod, headers: {} };

    if (body !== undefined && body !== null) {
      fetchOptions.headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text || null;
    }

    return NextResponse.json({
      url,
      method: upperMethod,
      status: response.status,
      ok: response.ok,
      body: parsed,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
