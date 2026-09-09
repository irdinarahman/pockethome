const urgencyColor = {
  high: "var(--claret)",
  medium: "var(--red-suits)",
  low: "var(--blush)",
};

export default function UpcomingRow({ title, daysLeft, urgency }) {
  return (
    <div className="upcoming-row">
      <span>{title}</span>
      <span
        className="upcoming-pill"
        style={{
          background: urgencyColor[urgency],
          color: urgency === "low" ? "var(--onyx)" : "var(--gintonic)",
        }}
      >
        {daysLeft} days
      </span>
    </div>
  );
}
