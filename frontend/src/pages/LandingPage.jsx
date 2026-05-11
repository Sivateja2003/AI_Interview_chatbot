import { Link } from "react-router-dom";
import { HiOutlineArrowSmallDown } from "react-icons/hi2";
import HeroRobot from "../assets/hero-robot.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-red-500/30">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-20" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-red-600 rotate-45 flex items-center justify-center transition-transform group-hover:rotate-[135deg] duration-500">
            <div className="w-4 h-4 border-2 border-white -rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tighter">INTERVIEW AI</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2 text-[11px] font-bold tracking-widest border border-white/10 hover:bg-white/5 transition-all uppercase">
            Try Demo
          </Link>
          <Link to="/login" className="px-5 py-2 text-[11px] font-bold tracking-widest bg-red-600 hover:bg-red-700 transition-all uppercase">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-8 pb-12">
        <div className="relative flex-1 grid grid-cols-12 items-center">

          {/* Left: Decorative Text "IA" */}
          <div className="col-span-4 relative z-10 select-none">
            <h1 className="text-[180px] lg:text-[240px] font-black leading-[0.8] tracking-tighter opacity-80 text-white">
              AI
            </h1>
            <div className="mt-12 max-w-[300px]">
              <p className="text-[13px] leading-relaxed text-white/60 mb-8 font-medium">
                INTERVIEW AI is a next-gen RAG powered platform that helps
                professionals prepare faster, practice smarter, and master every
                interaction with AI-driven insights.
              </p>
              <Link to="/login" className="inline-block px-8 py-4 bg-red-600 text-[12px] font-black tracking-[0.2em] hover:bg-red-700 transition-all uppercase group">
                Start with AI
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Center: Hero Asset */}
          <div className="col-span-4 flex justify-center relative">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-20" />
            <img
              src={HeroRobot}
              alt="AI Intelligence"
              className="w-full max-w-[500px] object-contain relative z-10 drop-shadow-[0_0_50px_rgba(255,45,33,0.2)] animate-float"
            />
          </div>

          {/* Right: Technical Identifiers */}
          <div className="col-span-4 flex flex-col items-end justify-center relative">
            <div className="flex items-start gap-12">
              <div className="text-[80px] lg:text-[120px] font-black stroke-text rotate-180 text-vertical tracking-tighter opacity-30 select-none">
                001
              </div>
              <div className="text-vertical pt-8">
                <div className="flex flex-col gap-6 text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase items-end">
                  <span>Efficiency</span>
                  <span>Intelligence</span>
                  <span>Dynamic Tool</span>
                </div>
                <div className="h-24 w-[1px] bg-white/10 mt-6 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Indicators */}
        <div className="flex items-end justify-between relative mt-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-red-600/50" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase">
              System Active: AI_EMBEDDING_P01
            </span>
          </div>
        </div>
      </main>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

