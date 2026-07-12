const COLOR_MAP = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export default function VehicleStatusBar({ label, value, color = "blue" }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>{label}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100">
        <div
          className={`h-2.5 rounded-full ${COLOR_MAP[color] || COLOR_MAP.blue}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}