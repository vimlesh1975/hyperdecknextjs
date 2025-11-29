// src/app/api/play/route.js
import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/hyperdeck"; // or adjust path if needed

export async function POST(req) {
  let clipId = null;

  try {
    // Try to read JSON body, may be empty for "simple play"
    const body = await req.json().catch(() => ({}));
    if (body && body.clipId !== undefined) {
      clipId = Number(body.clipId);
      if (!Number.isFinite(clipId)) {
        return NextResponse.json(
          { error: "clipId must be a number", clipIdRaw: body.clipId },
          { status: 400 }
        );
      }
    }
  } catch {
    // ignore body errors, treat as no clipId
  }

  try {
    if (clipId == null) {
      // 🔹 Simple: just hit play on current transport
      await fetch(`${BASE_URL}/transports/0/play`, { method: "POST" });
      return NextResponse.json({ status: "ok", mode: "playCurrent" });
    }

    // 🔹 Clip play: clear timeline, set clip, then play
    await fetch(`${BASE_URL}/timelines/0/clear`, { method: "POST" });
    await new Promise((r) => setTimeout(r, 100));

    await fetch(`${BASE_URL}/timelines/0`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clips: [clipId] }),
    });

    await fetch(`${BASE_URL}/transports/0/play`, { method: "POST" });

    return NextResponse.json({ status: "playing", clipId });
  } catch (err) {
    console.error("Error in /api/play:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
