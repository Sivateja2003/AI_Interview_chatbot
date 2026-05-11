import { useState, useEffect, useRef } from "react";
import { useInterview } from "../../hooks/useInterview";
import ChatMessage from "../../components/ChatMessage";
import EvaluationCard from "../../components/EvaluationCard";
import SourceHighlight from "../../components/SourceHighlight";
import AIAvatar from "../../components/AIAvatar"; // ✅ NEW
import { HiOutlinePaperAirplane, HiOutlineMicrophone, HiOutlineStop, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import aiBg from "../../assets/ai-bg.jpg"; // ✅ Import the background image

// ✅ Reuse background image
const bgImage = aiBg;

export default function InterviewPage() {
  const {
    messages,
    isLoading,
    evaluation,
    sources,
    isVoiceMode,
    isSpeaking,
    isListening,
    transcript,
    interimTranscript,
    setTranscript,
    startInterview,
    submitAnswer,
    nextQuestion,
    changeDifficulty,
    toggleVoiceMode,
    stopListening,
    startListening,
  } = useInterview();

  const [textAnswer, setTextAnswer] = useState("");
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden text-white">
      {/* BACKGROUND IMAGE & OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* HEADER CONTROLS */}
      <div className="relative z-20 flex justify-end p-6 gap-3">
        <button
          onClick={toggleVoiceMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
            isVoiceMode 
              ? "bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
          }`}
        >
          {isVoiceMode ? <HiOutlineMicrophone className="animate-pulse" /> : <HiOutlineChatBubbleLeftRight />}
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
            {isVoiceMode ? "Voice Mode Active" : "Switch to Voice"}
          </span>
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="relative z-10 flex gap-6 p-6 h-[calc(100vh-100px)]">
        
        {/* MAIN DISPLAY */}
        <div className="flex-1 flex flex-col">
          
          {!messages.length ? (
            <div className="m-auto text-center animate-fade-in-up">
              <h2 className="text-5xl font-black mb-4 tracking-tighter stroke-text">AI INTERVIEW</h2>
              <p className="text-white/40 mb-8 max-w-md mx-auto text-sm tracking-wide">
                Experience a professional one-on-one interview powered by adaptive RAG intelligence.
              </p>
              <button
                onClick={() => startInterview()}
                className="btn-primary px-10 py-4 text-xs font-black tracking-[0.3em] uppercase"
              >
                Establish Connection
              </button>
            </div>
          ) : isVoiceMode ? (
            /* IMMERSIVE VOICE MODE UI */
            <div className="flex-1 flex flex-col items-center justify-between py-12 animate-fade-in">
              <div className="flex-1 flex items-center justify-center">
                <AIAvatar 
                  state={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'} 
                  size="large" 
                />
              </div>

              <div className="w-full max-w-2xl px-6">
                {/* Transcript Visualization */}
                <div className="glass-card p-8 mb-6 border-red-500/20 bg-red-950/5 text-center min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                  {isListening ? (
                    <>
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-4">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        Listening
                      </div>
                      <p className="text-xl font-medium text-white/90 leading-relaxed italic">
                        "{transcript || interimTranscript || '...'}"
                      </p>
                      {interimTranscript && (
                        <p className="text-xs text-white/30 mt-2 italic">{interimTranscript}</p>
                      )}
                    </>
                  ) : transcript && !evaluation ? (
                    <>
                      <div className="text-white/30 text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
                        Captured — Ready to Submit
                      </div>
                      <p className="text-lg font-medium text-white/80 leading-relaxed italic">
                        "{transcript}"
                      </p>
                    </>
                  ) : evaluation ? (
                    <div className="text-blue-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-2">
                      Processing Evaluation
                    </div>
                  ) : isSpeaking ? (
                    <p className="text-lg font-medium text-white/40 uppercase tracking-widest animate-pulse">
                      AI Speaking...
                    </p>
                  ) : messages.length > 0 ? (
                    <p className="text-lg font-medium text-green-400/60 uppercase tracking-widest animate-pulse">
                      Tap "Start Speaking" to answer
                    </p>
                  ) : (
                    <p className="text-lg font-medium text-white/40 uppercase tracking-widest animate-pulse">
                      Waiting for AI synthesis...
                    </p>
                  )}
                </div>

                {/* Confirm/Controls Section */}
                <div className="flex justify-center gap-3 h-16">
                  {isListening ? (
                    <button
                      onClick={stopListening}
                      className="flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/5"
                    >
                      <HiOutlineStop className="text-red-500" />
                      <span className="text-[11px] font-bold tracking-widest uppercase">Stop Listening</span>
                    </button>
                  ) : transcript && !evaluation ? (
                    <>
                      <button
                        onClick={startListening}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/5"
                      >
                        <HiOutlineMicrophone className="text-green-400" />
                        <span className="text-[11px] font-bold tracking-widest uppercase">Continue</span>
                      </button>
                      <button
                        onClick={() => submitAnswer()}
                        disabled={isLoading}
                        className={`px-10 py-3 bg-red-600 hover:bg-red-700 rounded-full font-black tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all ${isLoading ? "opacity-50 cursor-not-allowed scale-95" : "animate-fade-in-up"}`}
                      >
                        {isLoading ? "Analyzing..." : "Confirm & Submit"}
                      </button>
                    </>
                  ) : evaluation ? (
                    <button
                      onClick={() => nextQuestion()}
                      className="px-10 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-black tracking-[0.2em] uppercase animate-fade-in-up"
                    >
                      Next Question
                    </button>
                  ) : !isSpeaking ? (
                    <button
                      onClick={startListening}
                      className="flex items-center gap-2 px-8 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-full transition-all"
                    >
                      <HiOutlineMicrophone />
                      <span className="text-[11px] font-bold tracking-widest uppercase">Start Speaking</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            /* TEXT CHAT MODE UI */
            <>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className="animate-fade-in-up">
                    {m.type === "question" && <ChatMessage type="ai">{m.content}</ChatMessage>}
                    {m.type === "answer" && <ChatMessage type="user">{m.content}</ChatMessage>}
                    {m.type === "evaluation" && <EvaluationCard {...m} />}
                    {m.type === "system" && (
                      <div className="text-center text-xs text-white/20 py-4 uppercase tracking-[0.4em]">
                        {m.content}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="glass-card p-4 bg-white/5 border-white/10">
                {evaluation ? (
                  <div className="flex gap-3">
                    <button onClick={() => changeDifficulty("easier")} className="flex-1 btn-secondary text-[10px] font-bold tracking-widest uppercase py-3">Easier</button>
                    <button onClick={() => nextQuestion()} className="flex-[2] btn-primary text-[10px] font-bold tracking-widest uppercase py-3">Next Question</button>
                    <button onClick={() => changeDifficulty("harder")} className="flex-1 btn-secondary text-[10px] font-bold tracking-widest uppercase py-3">Harder</button>
                  </div>
                ) : (
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      className="flex-1 px-5 py-4 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-red-500/50 transition-all resize-none h-[70px] text-sm"
                      placeholder="Type your response..."
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => { submitAnswer(textAnswer); setTextAnswer(""); }}
                      className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      disabled={isLoading || !textAnswer.trim()}
                    >
                      <HiOutlinePaperAirplane className="rotate-[-45deg] translate-x-0.5 -translate-y-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* SIDEBAR PANEL (SOURCES) */}
        {sources?.length > 0 && (
          <div className="w-80 hidden xl:block animate-fade-in">
            <div className="glass-card p-6 h-full overflow-y-auto bg-black/20 border-white/5">
              <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Context Retrieval
              </h3>
              <SourceHighlight sources={sources} />
            </div>
          </div>
        )}
      </div>

      {/* ADDITIONAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        .animate-pulse-fast { animation: pulse 0.5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}