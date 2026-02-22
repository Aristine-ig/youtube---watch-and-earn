"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Play, LogOut, LayoutDashboard, Users, ArrowDownToLine, ArrowLeft, Image as ImageIcon, X
} from "lucide-react";

interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  status: string;
  completion_pct: number;
  earned_amount: number;
  screenshot_verify: string[];
  started_at: string;
  completed_at: string | null;
  users: { email: string };
}

interface Task {
  id: string;
  channel_name: string;
  title: string;
}

export default function TaskScreenshotsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { 
      router.push("/login"); 
      return; 
    }
    
    const fetchData = async () => {
      try {
        // Fetch submissions with screenshots
        const submissionsRes = await fetch(`/api/admin/task-submissions?taskId=${taskId}`);
        if (submissionsRes.ok) {
          const data = await submissionsRes.json();
          // Filter to only include submissions with screenshots
          const withScreenshots = data.submissions.filter(
            (s: Submission) => s.screenshot_verify && s.screenshot_verify.length > 0
          );
          setSubmissions(withScreenshots);
        } else {
          toast.error("Failed to fetch submissions");
        }

        // Fetch task details
        const taskRes = await fetch("/api/admin/tasks");
        if (taskRes.ok) {
          const data = await taskRes.json();
          const foundTask = data.tasks.find((t: Task) => t.id === taskId);
          if (foundTask) {
            setTask(foundTask);
          }
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router, taskId]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 flex-wrap">
          <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-500">
              <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="white" />
            </div>
            <span className="text-lg sm:text-xl font-bold hidden sm:inline">WatchEarn</span>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">Admin</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            <Link href="/admin" className="flex items-center gap-1 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap">
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-1 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Users</span>
            </Link>
            <Link href="/admin/withdrawals" className="flex items-center gap-1 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap">
              <ArrowDownToLine className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Withdrawals</span>
            </Link>
            <button onClick={async () => { await logout(); router.push("/"); }} className="ml-1 text-gray-400 hover:text-white flex-shrink-0">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
            <ImageIcon className="h-6 w-6 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold">User Screenshots</h1>
              {task && (
                <p className="text-sm text-gray-400 mt-1">
                  {task.channel_name} - {task.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Screenshots</h3>
            <p className="text-sm text-gray-500">No users have submitted screenshots for this task yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-3 whitespace-nowrap">User Email</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Completion</th>
                  <th className="px-4 py-3 whitespace-nowrap">Earned</th>
                  <th className="px-4 py-3 whitespace-nowrap">Task Started At</th>
                  <th className="px-4 py-3 whitespace-nowrap">Submitted</th>
                  <th className="px-4 py-3 whitespace-nowrap">Screenshots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-gray-300">
                      {submission.users?.email || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        submission.status === "completed" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : submission.status === "in_progress"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {submission.completion_pct}%
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      ${Number(submission.earned_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(submission.started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {submission.completed_at ? new Date(submission.completed_at).toLocaleString() : "In Progress"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {submission.screenshot_verify.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(url)}
                            className="block rounded overflow-hidden border border-white/10 hover:border-emerald-500 transition"
                          >
                            <img
                              src={url}
                              alt={`Screenshot ${idx + 1}`}
                              className="w-16 h-16 object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt="Screenshot preview"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
