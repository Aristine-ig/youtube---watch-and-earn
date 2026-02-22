import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get the user info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all task completions with screenshots for this user
    const { data: completions, error } = await supabase
      .from("task_completions")
      .select(
        `
        id,
        task_id,
        status,
        completion_pct,
        earned_amount,
        screenshot_verify,
        started_at,
        completed_at,
        tasks(title, channel_name)
        `
      )
      .eq("user_id", userId)
      .not("screenshot_verify", "is", null)
      .order("completed_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter only completions that have actual screenshots
    const screenshotEntries = (completions || []).filter(
      (c) => c.screenshot_verify && Array.isArray(c.screenshot_verify) && c.screenshot_verify.length > 0
    );

    return NextResponse.json({ user, screenshots: screenshotEntries });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { error: msg },
      { status: msg === "Forbidden" ? 403 : 401 }
    );
  }
}
