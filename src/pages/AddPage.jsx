import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

const tabs = [
  { id: "task", label: "Task" },
  { id: "event", label: "Event" },
  { id: "expense", label: "Expense" },
  { id: "steps", label: "Steps" },
  { id: "upcoming", label: "Upcoming" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AddPage({ userId }) {
  const [activeTab, setActiveTab] = useState("task");
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Add something
      </Link>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setStatus(null);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              cursor: "pointer",
              background: activeTab === tab.id ? "var(--accent)" : "var(--surface)",
              color: activeTab === tab.id ? "var(--onyx)" : "var(--text)",
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === "task" && <TaskForm userId={userId} setStatus={setStatus} />}
      {activeTab === "event" && <EventForm userId={userId} setStatus={setStatus} />}
      {activeTab === "expense" && <ExpenseForm userId={userId} setStatus={setStatus} />}
      {activeTab === "steps" && <StepsForm userId={userId} setStatus={setStatus} />}
      {activeTab === "upcoming" && <UpcomingForm userId={userId} setStatus={setStatus} />}

      {status && (
        <p style={{ color: status.type === "error" ? "var(--red-suits)" : "var(--accent)", fontSize: 13, marginTop: 12 }}>
          {status.message}
        </p>
      )}

      {activeTab === "task" && <TaskList userId={userId} />}
    </div>
  );
}

function fieldStyle() {
  return {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "0.5px solid var(--text-muted)",
    background: "var(--surface)",
    color: "var(--text)",
    marginBottom: 12,
    fontSize: 14,
    boxSizing: "border-box",
  };
}

function TaskForm({ userId, setStatus }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("tasks")
      .insert({ user_id: userId, title: title.trim(), due_date: dueDate || null });
    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setTitle("");
    setDueDate("");
    setStatus({ type: "success", message: "Task added." });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input style={fieldStyle()} placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="field-label">Due date (optional)</label>
      <input style={fieldStyle()} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}

function EventForm({ userId, setStatus }) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("events")
      .insert({ user_id: userId, title: title.trim(), event_date: eventDate });
    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setTitle("");
    setStatus({ type: "success", message: "Event added." });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input style={fieldStyle()} placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="field-label">Event date</label>
      <input style={fieldStyle()} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Adding…" : "Add event"}
      </button>
    </form>
  );
}

function ExpenseForm({ userId, setStatus }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [spentAt, setSpentAt] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setStatus({ type: "error", message: "Enter a valid amount." });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("expenses")
      .insert({ user_id: userId, amount: parsed, note: note.trim() || null, spent_at: spentAt });
    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setAmount("");
    setNote("");
    setStatus({ type: "success", message: "Expense logged." });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        style={fieldStyle()}
        type="number"
        step="0.01"
        placeholder="Amount (RM)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input style={fieldStyle()} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <label className="field-label">Date spent</label>
      <input style={fieldStyle()} type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Logging…" : "Log expense"}
      </button>
    </form>
  );
}

function StepsForm({ userId, setStatus }) {
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(steps);
    if (!steps || Number.isNaN(parsed) || parsed < 0) {
      setStatus({ type: "error", message: "Enter a valid step count." });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("daily_stats")
      .upsert(
        { user_id: userId, stat_date: todayStr(), steps: parsed },
        { onConflict: "user_id,stat_date" }
      );
    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setStatus({ type: "success", message: "Steps updated for today." });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        style={fieldStyle()}
        type="number"
        min="0"
        placeholder="Today's step count"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />
      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Update steps"}
      </button>
    </form>
  );
}

function UpcomingForm({ userId, setStatus }) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) {
      setStatus({ type: "error", message: "Title and date are required." });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("upcoming_items")
      .insert({ user_id: userId, title: title.trim(), target_date: targetDate, urgency });
    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setTitle("");
    setTargetDate("");
    setStatus({ type: "success", message: "Added to upcoming." });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input style={fieldStyle()} placeholder="What's coming up?" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="field-label">Target date</label>
      <input style={fieldStyle()} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      <select style={fieldStyle()} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
        <option value="low">Low urgency</option>
        <option value="medium">Medium urgency</option>
        <option value="high">High urgency</option>
      </select>
      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Adding…" : "Add to upcoming"}
      </button>
    </form>
  );
}

function TaskList({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, is_done")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!cancelled && !error) setTasks(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleDone = async (task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t)));
    await supabase.from("tasks").update({ is_done: !task.is_done }).eq("id", task.id);
  };

  if (loading) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div className="section-label">Recent tasks</div>
      {tasks.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No tasks yet.</p>}
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => toggleDone(task)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--surface)",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 6,
            cursor: "pointer",
            opacity: task.is_done ? 0.5 : 1,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: "1.5px solid var(--accent)",
              background: task.is_done ? "var(--accent)" : "transparent",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, textDecoration: task.is_done ? "line-through" : "none" }}>{task.title}</span>
        </div>
      ))}
    </div>
  );
}
