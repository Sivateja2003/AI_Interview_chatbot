import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import {
  HiOutlineDocumentArrowUp,
  HiOutlineAcademicCap,
} from "react-icons/hi2";

import robot from "../../assets/robot-full.jpg";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden text-white">

      {/* ── BACKGROUND ROBOT ── */}
      {/* The robot image itself shifts slightly on hover to sell the "arm extending" illusion */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${robot})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: active === "upload"
            ? "scale(1.04) translateX(18px)"   // robot leans left arm forward
            : active === "interview"
              ? "scale(1.04) translateX(-18px)"  // robot leans right arm forward
              : "scale(1) translateX(0px)",
          transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      />

      {/* Dark overlay — fades the inactive side */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: active === "upload"
            ? "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)"
            : active === "interview"
              ? "linear-gradient(to left,  rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)"
              : "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.6))",
          transition: "background 0.5s ease",
        }}
      />

      {/* ── CONTENT ── */}
      <div className="relative z-10 w-full h-full min-h-screen px-10 py-8 flex flex-col">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ""}! 👋
          </h1>
          <p className="text-gray-400">
            Ready to ace your next interview? Let's get started.
          </p>
        </div>

        {/* ── CARDS — positioned to sit exactly on the robot's hands ── */}
        {/*
          The robot hands in your image sit roughly at vertical center,
          left hand ~30% from left, right hand ~70% from left.
          We use absolute positioning to place cards ON the hands.
        */}
        <div className="flex-1 relative">

          {/* ════ LEFT CARD — Upload (robot's LEFT hand) ════ */}
          <div
            onMouseEnter={() => setActive("upload")}
            onMouseLeave={() => setActive(null)}
            onClick={() => navigate("/dashboard/upload")}
            style={{
              position: "absolute",
              // Place card so it sits right on the robot's left hand
              left: "17%",
              top: "30%",

              width: 280,

              // The 3D "hand extending forward" effect:
              // On hover → moves up and toward viewer (translateZ via scale + translateY)
              // Idle     → card rests lower as if sitting in the open palm
              // Other hovered → card drops back and fades (robot retracted that arm)
              transform: active === "upload"
                ? "translate(-50%, -65%) scale(1.12) perspective(600px) rotateX(6deg)"
                : active === "interview"
                  ? "translate(-50%, -42%) scale(0.88) perspective(600px) rotateX(-4deg)"
                  : "translate(-50%, -50%) scale(1) perspective(600px) rotateX(2deg)",

              opacity: active === "interview" ? 0.15 : 1,

              transition: "transform 0.55s cubic-bezier(0.34,1.3,0.64,1), opacity 0.4s ease, box-shadow 0.4s ease",
              cursor: "pointer",
              zIndex: active === "upload" ? 20 : 10,

              padding: "24px",
              borderRadius: "16px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              background: active === "upload" || active === "interview"
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.03)",

              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            }}
          >
            {/* Glow under card — simulates light from robot's palm */}
            <div
              style={{
                position: "absolute",
                bottom: -16,
                left: "50%",
                transform: "translateX(-50%)",
                width: active === "upload" ? 200 : 120,
                height: 20,
                background: "rgba(96,165,250,0.35)",
                filter: "blur(20px)",
                borderRadius: "50%",
                transition: "width 0.4s ease, opacity 0.4s ease",
                opacity: active === "upload" ? 1 : 0.4,
                pointerEvents: "none",
              }}
            />

            <HiOutlineDocumentArrowUp
              style={{
                fontSize: 40,
                marginBottom: 14,
                color: active === "upload" ? "#93c5fd" : "#60a5fa",
                filter: active === "upload" ? "drop-shadow(0 0 8px rgba(147,197,253,0.8))" : "none",
                transition: "color 0.3s, filter 0.3s",
              }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              Upload Documents
            </h3>
            <p style={{ fontSize: 13, color: "rgba(156,163,175,1)", lineHeight: 1.5 }}>
              Upload resume & materials for AI analysis
            </p>

            {/* Subtle "held by hand" shadow line at bottom of card */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "10%",
                right: "10%",
                height: 3,
                borderRadius: "0 0 16px 16px",
                background: "linear-gradient(to right, transparent, rgba(96,165,250,0.6), transparent)",
                opacity: active === "upload" ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
          </div>

          {/* ════ RIGHT CARD — Interview (robot's RIGHT hand) ════ */}
          <div
            onMouseEnter={() => setActive("interview")}
            onMouseLeave={() => setActive(null)}
            onClick={() => navigate("/dashboard/interview")}
            style={{
              position: "absolute",
              // Place card on the robot's right hand
              left: "81%",     // move slightly left (72% → 68%)
              top: "30%",      // move slightly down (50% → 54%)
              width: 280,

              transform: active === "interview"
                ? "translate(-40%, -70%) scale(1.12) perspective(600px) rotateX(6deg)"
                : active === "upload"
                  ? "translate(-40%, -45%) scale(0.88) perspective(600px) rotateX(-4deg)"
                  : "translate(-40%, -55%) scale(1) perspective(600px) rotateX(2deg)",

              opacity: active === "upload" ? 0.15 : 1,

              transition: "transform 0.55s cubic-bezier(0.34,1.3,0.64,1), opacity 0.4s ease, box-shadow 0.4s ease",
              cursor: "pointer",
              zIndex: active === "interview" ? 20 : 10,

              padding: "24px",
              borderRadius: "16px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              background: active === "upload" || active === "interview"
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.03)",

              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: -16,
                left: "50%",
                transform: "translateX(-50%)",
                width: active === "interview" ? 200 : 120,
                height: 20,
                background: "rgba(52,211,153,0.35)",
                filter: "blur(20px)",
                borderRadius: "50%",
                transition: "width 0.4s ease, opacity 0.4s ease",
                opacity: active === "interview" ? 1 : 0.4,
                pointerEvents: "none",
              }}
            />

            <HiOutlineAcademicCap
              style={{
                fontSize: 40,
                marginBottom: 14,
                color: active === "interview" ? "#6ee7b7" : "#34d399",
                filter: active === "interview" ? "drop-shadow(0 0 8px rgba(110,231,183,0.8))" : "none",
                transition: "color 0.3s, filter 0.3s",
              }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              Start Interview
            </h3>
            <p style={{ fontSize: 13, color: "rgba(156,163,175,1)", lineHeight: 1.5 }}>
              Practice with AI-powered mock interviews
            </p>

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "10%",
                right: "10%",
                height: 3,
                borderRadius: "0 0 16px 16px",
                background: "linear-gradient(to right, transparent, rgba(52,211,153,0.6), transparent)",
                opacity: active === "interview" ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}