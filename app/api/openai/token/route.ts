import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "verse",
      }),
    });

    const data = await r.json();
    return NextResponse.json(data);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error("[GET /api/session] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
