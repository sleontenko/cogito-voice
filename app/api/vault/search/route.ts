import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

interface SearchResult {
  path: string;
  title: string;
  snippet: string;
}

export async function POST(request: Request) {
  try {
    const { parameters } = await request.json();
    const query = parameters?.query || "";

    if (!query) {
      return NextResponse.json({
        success: false,
        error: {
          error: "No query",
          code: "missing_query",
          level: "warn",
          content: "Please provide a search query",
        },
      });
    }

    // Search in content and path using ilike
    const { data, error } = await supabase
      .from("notes")
      .select("path, content")
      .or(`content.ilike.%${query}%,path.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({
        success: false,
        error: {
          error: "Search failed",
          code: "search_error",
          level: "error",
          content: "Database search failed",
        },
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: `No notes found matching "${query}"`,
      });
    }

    const results: SearchResult[] = data.map((note) => {
      const lines = note.content.split("\n");
      const title =
        lines.find((l: string) => l.startsWith("# "))?.replace("# ", "") ||
        note.path.split("/").pop()?.replace(".md", "") ||
        "Untitled";

      // Find snippet around match
      const contentLower = note.content.toLowerCase();
      const queryLower = query.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);
      const snippetStart = Math.max(0, matchIndex - 50);
      const snippetEnd = Math.min(
        note.content.length,
        matchIndex + query.length + 100
      );
      const snippet = note.content
        .slice(snippetStart, snippetEnd)
        .replace(/\n/g, " ")
        .trim();

      return { path: note.path, title, snippet: `...${snippet}...` };
    });

    const summary = results.map((r) => `- ${r.title}: ${r.snippet}`).join("\n");

    return NextResponse.json({
      success: true,
      data: `Found ${results.length} notes matching "${query}":\n${summary}`,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Search failed",
        code: "search_error",
        level: "error",
        content: "Failed to search vault",
      },
    });
  }
}
