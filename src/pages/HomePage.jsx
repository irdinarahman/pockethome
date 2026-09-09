import { Link } from "react-router-dom";
import { useHomeData } from "../hooks/useHomeData.js";
import { useSettings } from "../hooks/useSettings.js";
import { useSelfCareStreak } from "../hooks/useSelfCareStreak.js";
import StatCard from "../components/StatCard.jsx";
import UpcomingRow from "../components/UpcomingRow.jsx";

export default function HomePage({ userId }) {
  const { taskCount, eventCount, totalSpent, steps, upcoming, loading, error } = useHomeData(userId);
  const { settings, loading: settingsLoading } = useSettings(userId);
  const { streak, checkedInToday, loading: streakLoading, checkIn } = useSelfCareStreak(userId);

  if (loading || settingsLoading || streakLoading) {
    return <div style={{ paddingTop: 80, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  }

  if (error) {
    return (
      <div style={{ paddingTop: 80, textAlign: "center", color: "var(--red-suits)" }}>
        Couldn't load your data. {error}
      </div>
    );
  }

  const visibleUpcoming = upcoming.slice(0, settings.upcoming_limit);

  return (
    <div>
      {settings.show_greeting && <div className="greeting">Good morning</div>}

      <div className="section-label">Today</div>
      <div className="stat-grid">
        {settings.show_tasks && <StatCard value={taskCount} label="tasks" />}
        {settings.show_events && <StatCard value={eventCount} label="events" />}
        {settings.show_spending && <StatCard value={`RM${totalSpent.toFixed(0)}`} label="spent" />}
        {settings.show_steps && <StatCard value={steps.toLocaleString()} label="steps" />}
        {settings.show_streak && (
          <div
            className="stat-card"
            style={{
              gridColumn: "span 2",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{streak}-day self-care streak</span>
            <button
              onClick={checkIn}
              disabled={checkedInToday}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: checkedInToday ? "default" : "pointer",
                background: checkedInToday ? "transparent" : "var(--accent)",
                color: checkedInToday ? "var(--text-muted)" : "var(--onyx)",
                border: checkedInToday ? "1px solid var(--text-muted)" : "none",
              }}
            >
              {checkedInToday ? "Checked in" : "Check in"}
            </button>
          </div>
        )}
      </div>

      <div className="section-label">Upcoming</div>
      <div className="upcoming-list">
        {visibleUpcoming.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nothing upcoming yet.</p>
        )}
        {visibleUpcoming.map((item) => (
          <UpcomingRow key={item.id} title={item.title} daysLeft={item.daysLeft} urgency={item.urgency} />
        ))}
      </div>

      <Link to="/add" className="secondary" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 10 }}>
        + Add something
      </Link>
      <Link to="/settings" className="primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
        Customize widgets
      </Link>
    </div>
  );
}
