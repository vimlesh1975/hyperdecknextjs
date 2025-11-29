import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/hyperdeck";

export async function POST() {
  await fetch(`${BASE_URL}/transports/0/record`, { method: "POST" });
  return NextResponse.json({ status: "ok" });
}
