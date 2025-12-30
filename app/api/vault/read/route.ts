import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const { parameters } = await request.json();
    const notePath = parameters?.path || "";

    if (!notePath) {
      return NextResponse.json({
        success: false,
        error: {
          error: "No path",
          code: "missing_path",
          level: "warn",
          content: "Please provide a note path",
        },
      });
    }

    // Try exact match first
    let { data, error } = await supabase
      .from("notes")
      .select("content, path")
      .eq("path", notePath)
      .single();

    // Try with .md extension
    if (error && !notePath.endsWith(".md")) {
      const result = await supabase
        .from("notes")
        .select("content, path")
        .eq("path", notePath + ".md")
        .single();
      data = result.data;
      error = result.error;
    }

    // Try fuzzy search by path
    if (error) {
      const result = await supabase
        .from("notes")
        .select("content, path")
        .ilike("path", `%${notePath}%`)
        .limit(1)
        .single();
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return NextResponse.json({
        success: true,
        data: `Note not found: "${notePath}". Try searching for it instead.`,
      });
    }

    // Truncate if too long
    const truncated =
      data.content.length > 2000
        ? data.content.slice(0, 2000) + "...(truncated)"
        : data.content;

    return NextResponse.json({
      success: true,
      data: `Note: ${data.path}\n\n${truncated}`,
    });
  } catch (error) {
    console.error("Read note error:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Read failed",
        code: "read_error",
        level: "error",
        content: "Failed to read note",
      },
    });
  }
}
