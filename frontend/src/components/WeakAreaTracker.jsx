import { HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function WeakAreaTracker({ weakAreas }) {
  if (!weakAreas?.length) return null;
  const maxCount = Math.max(...weakAreas.map(w => w.count || 1));

  return (
    <div className="glass-card p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <HiOutlineExclamationTriangle style={{ color: "var(--accent-danger)" }} /> Weak Areas
      </h4>
      <div className="space-y-3">
        {weakAreas.map((area, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{area.topic || area}</span>
              {area.count && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{area.count}x</span>}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${((area.count || 1) / maxCount) * 100}%`, background: "var(--gradient-danger)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
