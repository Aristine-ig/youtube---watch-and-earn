import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Get all submissions for a task with user email and screenshots
    const { data: submissions, error } = await supabase
      .from("screenshot_verify")
      .select(
        `
        id,
        task_id,
        user_id,
        status,
        completion_pct,
        earned_amount,
        screenshot_verify,
        started_at,
        completed_at,
        users(email)
        `
      )
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissions: submissions || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
  }
}
