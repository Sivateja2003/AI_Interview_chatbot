export default function DifficultyBadge({ difficulty, small = false }) {
  const badgeClass = { beginner: "badge-beginner", intermediate: "badge-intermediate", advanced: "badge-advanced" }[difficulty] || "badge-intermediate";
  const emoji = { beginner: "🟢", intermediate: "🟡", advanced: "🔴" }[difficulty] || "⚪";
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${badgeClass} ${small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}`}>
      <span>{emoji}</span> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}
