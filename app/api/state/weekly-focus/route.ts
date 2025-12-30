import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

interface WeeklyFocusInput {
  focus: string;
  context?: string;
  top3?: string[];
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const { parameters } = await request.json();
    const input: WeeklyFocusInput = {
      focus: parameters?.focus || "",
      context: parameters?.context || "",
      top3: parameters?.top3 || [],
    };

    if (!input.focus) {
      return NextResponse.json({
        success: false,
        error: {
          error: "No focus",
          code: "missing_focus",
          level: "warn",
          content: "Please provide the weekly focus",
        },
      });
    }

    const weekStart = getWeekStart();
    const now = new Date().toISOString();

    // Save to state table
    const stateValue = {
      focus: input.focus,
      context: input.context,
      top3: input.top3,
      week_start: weekStart,
      set_at: now,
      source: "voice_agent",
    };

    const { error: stateError } = await supabase.from("state").upsert(
      {
        key: "weekly_focus",
        value: stateValue,
        updated_at: now,
      },
      { onConflict: "key" }
    );

    if (stateError) {
      console.error("State save error:", stateError);
      return NextResponse.json({
        success: false,
        error: {
          error: "Save failed",
          code: "state_error",
          level: "error",
          content: "Failed to save weekly focus to state",
        },
      });
    }

    // Update weekly.md note
    const top3Section =
      input.top3 && input.top3.length > 0
        ? `\n\n## TOP 3\n${input.top3.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
        : "";

    const contextSection = input.context
      ? `\n\n## Context\n${input.context}`
      : "";

    const weeklyContent = `# Weekly Focus\n\n**Week of ${weekStart}**\n\n## Focus\n${input.focus}${top3Section}${contextSection}\n\n---\n*Set via Voice Agent at ${now}*`;

    const { error: noteError } = await supabase.from("notes").upsert(
      {
        path: "03-Areas/Goals/weekly.md",
        content: weeklyContent,
        metadata: {
          type: "goal",
          period: "weekly",
          week_start: weekStart,
          source: "voice_agent",
        },
        updated_at: now,
      },
      { onConflict: "path" }
    );

    if (noteError) {
      console.error("Note save error:", noteError);
      // State was saved, so partial success
    }

    return NextResponse.json({
      success: true,
      data: `Weekly focus saved:\n\n📌 Focus: ${input.focus}${input.top3 && input.top3.length > 0 ? `\n\n🎯 TOP 3:\n${input.top3.map((t, i) => `${i + 1}. ${t}`).join("\n")}` : ""}`,
    });
  } catch (error) {
    console.error("Weekly focus error:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Save failed",
        code: "save_error",
        level: "error",
        content: "Failed to save weekly focus",
      },
    });
  }
}
