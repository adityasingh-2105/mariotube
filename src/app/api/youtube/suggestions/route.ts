import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // YouTube's public autocomplete endpoint (no API key needed)
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(q)}&hl=en&callback=cb`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/javascript",
      },
      next: { revalidate: 30 }, // cache for 30 seconds
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const text = await res.text();
    // Response format: cb(["query",[["suggestion1",0],["suggestion2",0],...]])
    const match = text.match(/cb\((.+)\)$/s);
    if (!match) return NextResponse.json({ suggestions: [] });

    const parsed = JSON.parse(match[1]);
    // parsed[1] is array of [suggestion, type, {extra}]
    const rawSuggestions: string[] = (parsed[1] as [string, number][]).map(
      (item) => item[0]
    );

    return NextResponse.json({ suggestions: rawSuggestions.slice(0, 10) });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
