import { signOut } from "../../lib/auth-client";
import { LogOut, Bell, GraduationCap, Settings, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

interface NavProps {
  session: any;
}

export default function DashboardNav({ session }: NavProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between py-6 z-50">
      {/* Brand */}
      <div 
        onClick={() => {
          if (session.user.role === "HEAD_TEACHER") navigate("/head-teacher");
          else if (session.user.role === "TEACHER") navigate("/teacher");
          else navigate("/student");
        }}
        className="flex items-center gap-4 cursor-pointer group/logo"
      >
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl blur opacity-25 group-hover/logo:opacity-40 transition duration-1000 group-hover/logo:duration-200" />
          <div className="relative w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-emerald-900/10 group-hover/logo:scale-105 transition-transform">
            <GraduationCap size={22} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 group-hover/logo:text-emerald-600 transition-colors">UniPortal</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Management System</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 mr-4">
          <NavButton icon={<Bell size={18} />} hasBadge onClick={() => setNotifOpen(!notifOpen)} />
          <NavButton icon={<Settings size={18} />} />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shadow-sm group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300">
              {(session.user.name ?? session.user.email)[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-none mb-0.5">{session.user.name?.split(' ')[0] || "User"}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{session.user.role?.replace('_', ' ') || "Faculty Member"}</p>
            </div>
            <ChevronDown size={14} className={cn("text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
          </button>

          {userMenuOpen && (
            <div className="absolute top-14 right-0 w-64 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 mb-2 border-b border-slate-100/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{session.user.email}</p>
              </div>
              
              <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-colors">
                <User size={18} /> Profile Settings
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-colors">
                <Bell size={18} /> Notifications
              </button>
              
              <div className="mt-2 pt-2 border-t border-slate-100/50">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Overlay */}
      {notifOpen && (
        <div className="absolute top-20 right-0 w-80 bg-white border border-slate-200 shadow-2xl rounded-[2rem] p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black">3 NEW</span>
          </div>
          <div className="space-y-4">
            {[
              { title: "Exam schedule released", time: "2h ago", icon: "📋", color: "bg-blue-50" },
              { title: "Grade updated: IT-3201", time: "5h ago", icon: "✅", color: "bg-emerald-50" },
              { title: "Faculty meeting today", time: "1d ago", icon: "📅", color: "bg-amber-50" },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={cn("size-10 rounded-xl flex items-center justify-center text-lg shadow-sm", n.color)}>
                  {n.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
            Mark all as read
          </button>
        </div>
      )}
    </header>
  );
}

function NavButton({ icon, hasBadge = false, onClick }: { icon: React.ReactNode, hasBadge?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
    >
      {icon}
      {hasBadge && (
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-sm animate-pulse" />
      )}
    </button>
  );
}

