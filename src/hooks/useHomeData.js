import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const todayStr = () => new Date().toISOString().slice(0, 10);

function daysBetween(targetDate) {
  const today = new Date(todayStr());
  const target = new Date(targetDate);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function urgencyFor(daysLeft) {
  if (daysLeft <= 5) return "high";
  if (daysLeft <= 14) return "medium";
  return "low";
}

export function useHomeData(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    taskCount: 0,
    eventCount: 0,
    totalSpent: 0,
    steps: 0,
    upcoming: [],
  });

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const today = todayStr();

    const [tasksRes, eventsRes, expensesRes, statsRes, upcomingRes] = await Promise.all([
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_done", false),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("event_date", today),
      supabase.from("expenses").select("amount").eq("user_id", userId).eq("spent_at", today),
      supabase.from("daily_stats").select("steps").eq("user_id", userId).eq("stat_date", today).maybeSingle(),
      supabase.from("upcoming_items").select("id, title, target_date").eq("user_id", userId).order("target_date", { ascending: true }).limit(5),
    ]);

    const firstError =
      tasksRes.error || eventsRes.error || expensesRes.error || statsRes.error || upcomingRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const totalSpent = (expensesRes.data || []).reduce((sum, row) => sum + Number(row.amount), 0);
    const upcoming = (upcomingRes.data || []).map((row) => {
      const daysLeft = daysBetween(row.target_date);
      return { id: row.id, title: row.title, daysLeft, urgency: urgencyFor(daysLeft) };
    });

    setData({
      taskCount: tasksRes.count || 0,
      eventCount: eventsRes.count || 0,
      totalSpent,
      steps: statsRes.data?.steps || 0,
      upcoming,
    });
    setLoading(false);
  }, [userId]);

  // Initial load whenever userId is (re)known.
  useEffect(() => {
    load();
  }, [load]);

  // Refetch whenever the tab/page becomes visible again, or gets restored
  // from Safari's back-forward cache (bfcache) after navigating back — both
  // cases can otherwise show stale data without a manual hard refresh.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        load();
      }
    }
    function handlePageShow() {
      load();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [load]);

  return { ...data, loading, error };
}
