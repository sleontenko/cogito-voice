import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

interface Context {
  weekly_focus: unknown;
  pending_actions: unknown;
  today_summary: string | null;
  goals: {
    yearly: string | null;
    monthly: string | null;
    weekly: string | null;
  };
}

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const context: Context = {
      weekly_focus: null,
      pending_actions: null,
      today_summary: null,
      goals: {
        yearly: null,
        monthly: null,
        weekly: null,
      },
    };

    // Get state entries
    const { data: stateData } = await supabase
      .from("state")
      .select("key, value")
      .in("key", ["weekly_focus", "pending_actions"]);

    if (stateData) {
      for (const entry of stateData) {
        if (entry.key === "weekly_focus") context.weekly_focus = entry.value;
        if (entry.key === "pending_actions")
          context.pending_actions = entry.value;
      }
    }

    // Get today's note
    const today = getTodayDate();
    const { data: todayNote } = await supabase
      .from("notes")
      .select("content")
      .eq("path", `01-Daily/${today}.md`)
      .single();

    if (todayNote) {
      // Extract summary section if exists
      const summaryMatch = todayNote.content.match(
        /## Daily Summary\n([\s\S]*?)(?=\n##|$)/
      );
      context.today_summary = summaryMatch ? summaryMatch[1].trim() : null;
    }

    // Get goal files
    const goalPaths = {
      yearly: "03-Areas/Goals/2025.md",
      monthly: "03-Areas/Goals/monthly.md",
      weekly: "03-Areas/Goals/weekly.md",
    };

    for (const [key, path] of Object.entries(goalPaths)) {
      const { data: goalNote } = await supabase
        .from("notes")
        .select("content")
        .eq("path", path)
        .single();

      if (goalNote) {
        // Truncate for voice context
        context.goals[key as keyof typeof context.goals] =
          goalNote.content.length > 1000
            ? goalNote.content.slice(0, 1000) + "..."
            : goalNote.content;
      }
    }

    return NextResponse.json({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error("Context fetch error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch context",
    });
  }
}

// POST handler for tool compatibility
export async function POST() {
  return GET();
}
