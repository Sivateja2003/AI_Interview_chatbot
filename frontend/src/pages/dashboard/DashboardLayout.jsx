import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="h-screen flex flex-col bg-black">

      {/* NAVBAR */}
      <Navbar />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR (ALWAYS VISIBLE) */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1 relative overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}