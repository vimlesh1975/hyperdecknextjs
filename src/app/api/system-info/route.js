import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/hyperdeck";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const urls = {
      product: `${BASE_URL}/system/product`,
      codecFormat: `${BASE_URL}/system/codecFormat`,
      supportedVideoFormats: `${BASE_URL}/system/supportedVideoFormats`,
      videoFormat: `${BASE_URL}/system/videoFormat`,
      defaultTimelineFormat: `${BASE_URL}/timelines/0/defaultVideoFormat`,
      timelineFormat: `${BASE_URL}/timelines/0/videoFormat`,
      mediaActive: `${BASE_URL}/media/active`,
      mediaWorkingset: `${BASE_URL}/media/workingset`,
      transport: `${BASE_URL}/transports/0`,
      inputVideoSource: `${BASE_URL}/transports/0/inputVideoSource`,
      timecode: `${BASE_URL}/transports/0/timecode`,
    };

    const entries = await Promise.all(
      Object.entries(urls).map(async ([key, url]) => {
        try {
          const resp = await fetch(url, { cache: "no-store" });
          const text = await resp.text();
          if (!resp.ok) {
            return [key, { error: true, status: resp.status, text }];
          }
          let json;
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            json = text || null;
          }
          return [key, json];
        } catch (e) {
          return [key, { error: true, message: e.message }];
        }
      })
    );

    return NextResponse.json(Object.fromEntries(entries));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
