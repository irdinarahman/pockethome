import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function useSelfCareStreak(userId) {
  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("self_care_streak")
      .select("current_streak, last_checkin_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load streak:", error.message);
    } else {
      setStreak(data?.current_streak || 0);
      setCheckedInToday(data?.last_checkin_date === todayStr());
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = useCallback(async () => {
    const today = todayStr();

    const { data } = await supabase
      .from("self_care_streak")
      .select("current_streak, last_checkin_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (data?.last_checkin_date === today) {
      // Already checked in today, nothing to do.
      return;
    }

    const continuingStreak = data?.last_checkin_date === yesterdayStr();
    const nextStreak = continuingStreak ? (data.current_streak || 0) + 1 : 1;

    const { error } = await supabase
      .from("self_care_streak")
      .upsert(
        { user_id: userId, current_streak: nextStreak, last_checkin_date: today },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Failed to check in:", error.message);
      return;
    }

    setStreak(nextStreak);
    setCheckedInToday(true);
  }, [userId]);

  return { streak, checkedInToday, loading, checkIn };
}
