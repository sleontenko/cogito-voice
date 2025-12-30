import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function POST() {
  try {
    const today = getTodayDate();
    const notePath = `01-Daily/${today}.md`;

    const { data, error } = await supabase
      .from("notes")
      .select("content, path")
      .eq("path", notePath)
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: true,
        data: `No daily note exists for today (${today}) yet.`,
      });
    }

    // Truncate if too long (keep first 2000 chars for voice)
    const truncated =
      data.content.length > 2000
        ? data.content.slice(0, 2000) + "...(truncated)"
        : data.content;

    return NextResponse.json({
      success: true,
      data: `Today's note (${today}):\n\n${truncated}`,
    });
  } catch (error) {
    console.error("Today note error:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Read failed",
        code: "read_error",
        level: "error",
        content: "Failed to read today's note",
      },
    });
  }
}
