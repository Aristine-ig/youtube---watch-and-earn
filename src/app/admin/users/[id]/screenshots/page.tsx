"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  LogOut,
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowLeft,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface TaskInfo {
  title: string;
  channel_name: string;
}

interface ScreenshotEntry {
  id: string;
  task_id: string;
  status: string;
  completion_pct: number;
  earned_amount: number;
  screenshot_verify: string[];
  started_at: string;
  completed_at: string | null;
  tasks: TaskInfo;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export default function UserScreenshotsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [screenshots, setScreenshots] = useState<ScreenshotEntry[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchScreenshots = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${userId}/screenshots`);
    if (res.ok) {
      const data = await res.json();
      setScreenshots(data.screenshots);
      setUserInfo(data.user);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchScreenshots().finally(() => setLoading(false));
  }, [user, authLoading, router, fetchScreenshots]);

  const totalScreenshots = screenshots.reduce(
    (acc, entry) => acc + (entry.screenshot_verify?.length || 0),
    0
  );

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 flex-wrap">
          <Link
            href="/admin"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-500">
              <Play
                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                fill="white"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold hidden sm:inline">
              WatchEarn
            </span>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap"
            >
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 sm:px-3 py-2 text-xs sm:text-sm text-white whitespace-nowrap"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Users</span>
            </Link>
            <Link
              href="/admin/withdrawals"
              className="flex items-center gap-1 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap"
            >
              <ArrowDownToLine className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Withdrawals</span>
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="ml-1 text-gray-400 hover:text-white flex-shrink-0"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <ImageIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Screenshots for {userInfo?.name || "User"}
              </h1>
              <p className="text-sm text-gray-400">
                {userInfo?.email} &middot; {totalScreenshots} screenshot
                {totalScreenshots !== 1 ? "s" : ""} across{" "}
                {screenshots.length} task
                {screenshots.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Screenshots Table */}
        {screenshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
            <ImageIcon className="mb-3 h-10 w-10 text-gray-600" />
            <p className="text-gray-400">
              No screenshots found for this user.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-white/5">
            <table className="w-full text-xs sm:text-sm">
              <thead className="border-b border-white/10 bg-white/5 sticky top-0">
                <tr className="text-left text-gray-400">
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">#</th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Task Title
                  </th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Channel
                  </th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Completion
                  </th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Earned
                  </th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Submitted At
                  </th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    Screenshots
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {screenshots.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="px-3 sm:px-4 py-3 text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-medium max-w-[180px] truncate">
                      {entry.tasks?.title || "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-400 max-w-[120px] truncate">
                      {entry.tasks?.channel_name || "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium inline-block ${
                          entry.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : entry.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      {entry.completion_pct}%
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-emerald-400 font-medium whitespace-nowrap">
                      ${Number(entry.earned_amount).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-400 whitespace-nowrap text-xs sm:text-sm">
                      {entry.completed_at
                        ? new Date(entry.completed_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.screenshot_verify.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setLightboxUrl(url)}
                            className="group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 transition hover:border-emerald-500"
                          >
                            <img
                              src={url}
                              alt={`Screenshot ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                              <ImageIcon className="h-4 w-4 text-white" />
                            </div>
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

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 border border-white/10 text-gray-400 transition hover:text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={lightboxUrl}
              alt="Screenshot full view"
              className="max-h-[85vh] max-w-[85vw] rounded-xl border border-white/10 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
