import { useState, useEffect } from "react";
import { getHistory } from "../../lib/api";
import bgImage from "../../assets/ai-bg.jpg";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getHistory()
      .then((d) => setSessions(d.sessions || []))
      .catch(() => { });
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* GLOW BLOBS */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[150px]" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-4xl mx-auto p-6">

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-8">
          📋 Session History
        </h1>

        {/* EMPTY STATE */}
        {sessions.length === 0 && (
          <div className="glass-card p-6 text-center text-gray-400">
            No sessions yet. Start an interview to see history here.
          </div>
        )}

        {/* SESSIONS */}
        {sessions.map((s) => (
          <div
            key={s.session_id}
            className="glass-card p-6 mb-6 hover:scale-[1.01] transition"
          >
            {/* SESSION HEADER */}
            <div className="mb-3">
              <p className="font-semibold text-lg">
                Session {s.session_id.slice(0, 8)}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(s.started_at).toLocaleString()}
              </p>
            </div>

            {/* QUESTIONS */}
            <div className="space-y-3">
              {s.interactions.map((i, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 p-4 rounded-lg"
                >
                  <p className="font-medium text-sm">
                    Q: {i.question}
                  </p>

                  {i.score && (
                    <p className="text-xs text-blue-300 mt-2">
                      Score: {i.score}/10
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* STYLES */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 0 30px rgba(0, 150, 255, 0.15);
        }
      `}</style>
    </div>
  );
}