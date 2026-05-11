import { HiOutlineSparkles, HiOutlineUser } from "react-icons/hi2";
import DifficultyBadge from "./DifficultyBadge";

export default function ChatMessage({ type, children, difficulty, topic }) {
  const isAI = type === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] ${isAI ? "chat-bubble-ai" : "chat-bubble-user"} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          {isAI ? (
            <>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <HiOutlineSparkles className="text-white text-xs" />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--accent-secondary)" }}>InterviewAI</span>
              {difficulty && <DifficultyBadge difficulty={difficulty} small />}
              {topic && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(116,185,255,0.15)", color: "var(--accent-info)" }}>{topic}</span>}
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,206,201,0.2)" }}>
                <HiOutlineUser className="text-xs" style={{ color: "var(--accent-success)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--accent-success)" }}>You</span>
            </>
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{children}</p>
      </div>
    </div>
  );
}
