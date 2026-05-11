export default function TimerBar({ timeLeft, totalTime }) {
  const percent = Math.max(0, (timeLeft / totalTime) * 100);
  const color = percent > 50 ? "var(--accent-success)" : percent > 20 ? "var(--accent-warning)" : "var(--accent-danger)";
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color }}>⏱️ Time Remaining</span>
        <span className="text-sm font-bold" style={{ color }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
      </div>
      <div className="timer-bar"><div className="timer-bar-fill" style={{ width: `${percent}%`, background: color }} /></div>
    </div>
  );
}
