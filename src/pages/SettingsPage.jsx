import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../hooks/useSettings.js";
import ToggleRow from "../components/ToggleRow.jsx";
import { requestNotificationPermission, getNotificationPermission, isPushSupported } from "../lib/onesignal.js";

const sizeOptions = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

const upcomingLimitOptions = [3, 5, 10];

export default function SettingsPage({ userId }) {
  const { settings, loading, save } = useSettings(userId);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = () => {
    requestNotificationPermission();
    // Permission prompt is async and browser-driven; poll briefly for the result.
    const check = setInterval(() => {
      const current = getNotificationPermission();
      if (current !== "default") {
        setPermission(current);
        clearInterval(check);
      }
    }, 500);
    setTimeout(() => clearInterval(check), 15000);
  };

  if (loading) {
    return <div style={{ paddingTop: 80, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Customize home
      </Link>

      <div className="section-label">Widget size</div>
      <div className="size-picker">
        {sizeOptions.map((opt) => (
          <div
            key={opt.id}
            className={`size-option ${settings.widget_size === opt.id ? "selected" : ""}`}
            onClick={() => save({ widget_size: opt.id })}
          >
            {opt.label}
          </div>
        ))}
      </div>

      <div className="section-label">Greeting</div>
      <ToggleRow
        label="Good morning message"
        checked={settings.show_greeting}
        onChange={(val) => save({ show_greeting: val })}
      />

      <div className="section-label" style={{ marginTop: 20 }}>
        Today stats
      </div>
      <ToggleRow label="Tasks" checked={settings.show_tasks} onChange={(val) => save({ show_tasks: val })} />
      <ToggleRow label="Events" checked={settings.show_events} onChange={(val) => save({ show_events: val })} />
      <ToggleRow
        label="Spending"
        checked={settings.show_spending}
        onChange={(val) => save({ show_spending: val })}
      />
      <ToggleRow label="Steps" checked={settings.show_steps} onChange={(val) => save({ show_steps: val })} />
      <ToggleRow
        label="Self-care streak"
        checked={settings.show_streak}
        onChange={(val) => save({ show_streak: val })}
      />

      <div className="section-label" style={{ marginTop: 20 }}>
        Upcoming
      </div>
      <div className="toggle-row" style={{ cursor: "default" }}>
        <span>Show up to</span>
        <select
          value={settings.upcoming_limit}
          onChange={(e) => save({ upcoming_limit: Number(e.target.value) })}
          style={{
            background: "var(--onyx)",
            color: "var(--text)",
            border: "1px solid var(--text-muted)",
            borderRadius: 8,
            padding: "4px 8px",
          }}
        >
          {upcomingLimitOptions.map((n) => (
            <option key={n} value={n}>
              {n} items
            </option>
          ))}
        </select>
      </div>

      <div className="section-label" style={{ marginTop: 20 }}>
        Notifications
      </div>
      {!isPushSupported() && (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          This browser doesn't support push notifications.
        </p>
      )}
      {isPushSupported() && permission === "granted" && (
        <div className="toggle-row" style={{ cursor: "default" }}>
          <span>Notifications enabled</span>
          <i className="ti ti-check" style={{ color: "var(--accent)" }} aria-hidden="true" />
        </div>
      )}
      {isPushSupported() && permission === "denied" && (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Notifications are blocked for this site. Enable them from your browser's site settings.
        </p>
      )}
      {isPushSupported() && permission === "default" && (
        <button className="secondary" onClick={handleEnableNotifications} style={{ marginBottom: 8 }}>
          Enable notifications
        </button>
      )}

      <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 20 }}>
        Changes save automatically.
      </p>
    </div>
  );
}
