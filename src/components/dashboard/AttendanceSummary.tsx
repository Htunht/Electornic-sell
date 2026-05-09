import { Users, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  code: string;
  name: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
}

interface AttendanceSummaryProps {
  attendance: AttendanceRecord[];
  compact?: boolean;
}

function getStatusColor(pct: number) {
  if (pct >= 90) return { bar: "bg-emerald-500 shadow-emerald-200", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
  if (pct >= 75) return { bar: "bg-blue-500 shadow-blue-200", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
  if (pct >= 60) return { bar: "bg-amber-500 shadow-amber-200", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
  return { bar: "bg-rose-500 shadow-rose-200", text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
}

export default function AttendanceSummary({ attendance, compact = false }: AttendanceSummaryProps) {
  const overall = {
    total: attendance.reduce((s, a) => s + a.total, 0),
    present: attendance.reduce((s, a) => s + a.present, 0),
    absent: attendance.reduce((s, a) => s + a.absent, 0),
    leave: attendance.reduce((s, a) => s + a.leave, 0),
  };
  const overallPct = overall.total > 0 ? Math.round((overall.present / overall.total) * 100) : 0;
  const overallStyle = getStatusColor(overallPct);

  return (
    <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Attendance Analytics</h3>
            <p className="text-xs text-slate-400 font-bold">{overall.total} Total Sessions</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all shadow-sm", overallStyle.bg, overallStyle.text, overallStyle.border)}>
          {overallPct}% Overall
        </div>
      </div>

      {/* Main Stats Row */}
      {!compact && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <AttendanceStatCard icon={<CheckCircle2 size={18} />} label="Present" value={overall.present} color="text-emerald-500" bg="bg-emerald-50/50" />
          <AttendanceStatCard icon={<XCircle size={18} />} label="Absent" value={overall.absent} color="text-rose-500" bg="bg-rose-50/50" />
          <AttendanceStatCard icon={<Clock size={18} />} label="Leave" value={overall.leave} color="text-amber-500" bg="bg-amber-50/50" />
        </div>
      )}

      {/* Subject List */}
      <div className="space-y-6">
        {attendance.map((a) => {
          const pct = Math.round((a.present / a.total) * 100);
          const style = getStatusColor(pct);
          return (
            <div key={a.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{a.name}</p>
                    <ArrowUpRight size={14} className="text-slate-200 group-hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                  {!compact && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.code} · {a.present} of {a.total} Sessions</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-black transition-colors", style.text)}>{pct}%</p>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", style.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {!compact && (
                <div className="flex gap-4 mt-3">
                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">✓ {a.present} Present</span>
                  <span className="text-[9px] font-black text-rose-500/80 uppercase tracking-tighter bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100/50">✗ {a.absent} Absent</span>
                  <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">⏸ {a.leave} Leave</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning Alert if < 75% */}
      {overallPct < 75 && (
        <div className="mt-10 p-5 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="font-black text-rose-900 text-sm mb-1 uppercase tracking-tight">Attendance Warning</h4>
            <p className="text-xs text-rose-700/80 leading-relaxed font-medium">
              Your overall attendance is currently <span className="font-black">{overallPct}%</span>, which is below the minimum required 75%. This may affect your eligibility for examinations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendanceStatCard({ icon, label, value, color, bg }: { icon: React.ReactNode, label: string, value: number, color: string, bg: string }) {
  return (
    <div className={cn("p-4 rounded-3xl border border-white shadow-sm flex flex-col items-center gap-2 transition-transform hover:scale-105 duration-300", bg)}>
      <div className={color}>{icon}</div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}
