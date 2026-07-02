import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/hyperdeck";

export async function POST(req) {
  try {
    let target = "all";
    try {
      const body = await req.json();
      if (body && body.deck) {
        target = body.deck;
      }
    } catch (e) {
      // Body might be empty, default to "all"
    }

    const controllers = [];
    if (target === "all" || target === "deck1" || target === "1") {
      controllers.push({ id: "deck1", url: `${getBaseUrl("deck1")}/transports/0/record` });
    }
    if (target === "all" || target === "deck2" || target === "2") {
      controllers.push({ id: "deck2", url: `${getBaseUrl("deck2")}/transports/0/record` });
    }
    if (target === "all" || target === "deck3" || target === "3") {
      controllers.push({ id: "deck3", url: `${getBaseUrl("deck3")}/transports/0/record` });
    }
    if (target === "all" || target === "deck4" || target === "4") {
      controllers.push({ id: "deck4", url: `${getBaseUrl("deck4")}/transports/0/record` });
    }

    const results = await Promise.all(
      controllers.map(async (deck) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(deck.url, { 
            method: "POST",
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          const text = await response.text();
          let body;
          try {
            body = text ? JSON.parse(text) : null;
          } catch {
            body = text || null;
          }
          
          return {
            deck: deck.id,
            status: response.status,
            ok: response.ok,
            body
          };
        } catch (err) {
          return {
            deck: deck.id,
            ok: false,
            error: err.name === "AbortError" ? "Request timed out" : (err.message || "Request failed")
          };
        }
      })
    );

    return NextResponse.json({ status: "ok", results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

