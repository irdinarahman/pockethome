export default function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="toggle-row" onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <div className={`switch ${checked ? "on" : "off"}`}>
        <div className="switch-knob" />
      </div>
    </div>
  );
}
