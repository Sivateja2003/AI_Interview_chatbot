import { useAuth } from "../lib/auth-context";
import { useNavigate } from "react-router-dom";
import { HiOutlineSparkles, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b" style={{ background: "rgba(10,10,26,0.8)", backdropFilter: "blur(20px)", borderColor: "var(--border-glass)" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
          <HiOutlineSparkles className="text-white text-lg" />
        </div>
        <span className="text-lg font-bold tracking-tight">InterviewAI</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--gradient-primary)" }}>
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-sm hidden md:block" style={{ color: "var(--text-secondary)" }}>
            {user?.displayName || user?.email}
          </span>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2 py-2 px-3" style={{ color: "var(--accent-danger)" }}>
          <HiOutlineArrowRightOnRectangle />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </nav>
  );
}
