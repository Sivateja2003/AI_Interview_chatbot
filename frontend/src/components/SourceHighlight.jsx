import { useState } from "react";
import { HiOutlineDocumentText, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

export default function SourceHighlight({ sources }) {
  const [expanded, setExpanded] = useState(null);
  if (!sources?.length) return null;

  return (
    <div className="glass-card p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <HiOutlineDocumentText style={{ color: "var(--accent-secondary)" }} /> Retrieved Context ({sources.length})
      </h4>
      <div className="space-y-2">
        {sources.map((s, i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)" }}>
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs">{s.doc_type === "resume" ? "📄 Resume" : "📋 JD"}</span>
              </div>
              {expanded === i ? <HiOutlineChevronUp className="text-sm" /> : <HiOutlineChevronDown className="text-sm" />}
            </button>
            {expanded === i && (
              <div className="px-3 pb-3">
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
