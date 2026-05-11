import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineDocumentArrowUp,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
} from "react-icons/hi2";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { href: "/dashboard/upload", label: "Upload", icon: HiOutlineDocumentArrowUp },
  { href: "/dashboard/interview", label: "Interview", icon: HiOutlineChatBubbleLeftRight },
  { href: "/dashboard/history", label: "History", icon: HiOutlineClock },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl relative">

      {/* 🔥 subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
              ${isActive
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-lg shadow-purple-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {/* ICON */}
              <Icon
                className={`text-lg transition ${isActive
                    ? "text-purple-400"
                    : "group-hover:text-blue-400"
                  }`}
              />

              {/* LABEL */}
              {item.label}

              {/* ACTIVE GLOW BAR */}
              {isActive && (
                <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}