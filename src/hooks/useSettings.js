import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const defaultSettings = {
  show_greeting: true,
  show_tasks: true,
  show_events: true,
  show_spending: true,
  show_steps: true,
  show_streak: true,
  widget_size: "medium",
  upcoming_limit: 3,
};

export function useSettings(userId) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("widget_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("Failed to load settings:", error.message);
      } else if (data) {
        setSettings(data);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = useCallback(
    async (updates) => {
      const next = { ...settings, ...updates };
      setSettings(next);
      const { error } = await supabase
        .from("widget_settings")
        .upsert({ user_id: userId, ...next }, { onConflict: "user_id" });
      if (error) console.error("Failed to save settings:", error.message);
      return error;
    },
    [settings, userId]
  );

  return { settings, loading, save };
}
