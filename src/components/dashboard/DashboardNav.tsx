import { signOut } from "../../lib/auth-client";
import { LogOut, Bell, GraduationCap, Settings } from "lucide-react";
import { useState } from "react";

interface NavProps {
  session: { user: { name?: string | null; email: string; image?: string | null } };
}

export default function DashboardNav({ session }: NavProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex items-center justify-between py-5">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">UniPortal</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Student Dashboard</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <Bell size={16} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
          {notifOpen && (
            <div className="absolute top-12 right-0 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Notifications</p>
              {[
                { title: "Exam schedule released", time: "2h ago", icon: "📋" },
                { title: "Grade updated: IT-3201", time: "5h ago", icon: "✅" },
                { title: "Holiday: May 5th", time: "1d ago", icon: "🏖️" },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-lg">{n.icon}</span>
                  <div>
                    <p className="text-sm text-slate-700">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <Settings size={16} className="text-slate-600" />
        </button>

        {/* User Avatar + Logout */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs font-bold text-white shadow">
            {(session.user.name ?? session.user.email)[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">{session.user.name ?? "Student"}</p>
            <p className="text-[10px] text-slate-400">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="ml-1 w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} className="text-red-500" />
          </button>
        </div>
      </div>
    </header>

  );
}
