import { HiOutlineLightBulb, HiOutlineBeaker } from "react-icons/hi2";

export default function EvaluationCard({ score, feedback, modelAnswer, weakAreas }) {
  const getScoreColor = (s) => s >= 7 ? "var(--accent-success)" : s >= 4 ? "var(--accent-warning)" : "var(--accent-danger)";
  const scorePercent = (score / 10) * 100;

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-5 mb-5">
        <div className="score-ring" style={{ "--score-color": getScoreColor(score), "--score-percent": scorePercent, color: getScoreColor(score) }}>{score}</div>
        <div className="flex-1">
          <h4 className="font-semibold mb-2">Evaluation Response</h4>
          <p className="text-xl font-bold" style={{ color: getScoreColor(score) }}>
            {score >= 7 ? "Good job!" : score >= 4 ? "Needs improvement" : "Weak"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl" style={{ background: "rgba(116,185,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineLightBulb style={{ color: "var(--accent-info)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--accent-info)" }}>Critical Feedback</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{feedback}</p>
        </div>

        <div className="p-3 rounded-xl" style={{ background: "rgba(0,206,201,0.08)" }}>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineBeaker style={{ color: "var(--accent-success)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--accent-success)" }}>Model Answer</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{modelAnswer}</p>
        </div>

        {weakAreas?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Weak areas:</span>
            {weakAreas.map((area, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,107,107,0.1)", color: "var(--accent-danger)" }}>{area}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
