import { NextResponse } from "next/server";
import { resolveUrl } from "@/lib/hyperdeck";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const urls = {
      product: resolveUrl(req, "/system/product"),
      codecFormat: resolveUrl(req, "/system/codecFormat"),
      supportedVideoFormats: resolveUrl(req, "/system/supportedVideoFormats"),
      videoFormat: resolveUrl(req, "/system/videoFormat"),
      defaultTimelineFormat: resolveUrl(req, "/timelines/0/defaultVideoFormat"),
      timelineFormat: resolveUrl(req, "/timelines/0/videoFormat"),
      mediaActive: resolveUrl(req, "/media/active"),
      mediaWorkingset: resolveUrl(req, "/media/workingset"),
      transport: resolveUrl(req, "/transports/0"),
      inputVideoSource: resolveUrl(req, "/transports/0/inputVideoSource"),
      timecode: resolveUrl(req, "/transports/0/timecode"),
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
