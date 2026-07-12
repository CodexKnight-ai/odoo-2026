import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const ACCENT_MAP = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  orange: "border-l-orange-500",
  red: "border-l-red-500",
};

export default function KpiCard({ label, value, accentColor = "blue", loading }) {
  return (
    <div
      className={cn(
        "min-w-[140px] flex-1 rounded-md border border-l-4 bg-card p-4 shadow-sm",
        ACCENT_MAP[accentColor] || ACCENT_MAP.blue
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-6 w-12" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}