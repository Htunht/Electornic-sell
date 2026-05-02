import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

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
  if (pct >= 90) return { bar: "bg-emerald-500", text: "text-emerald-400", ring: "border-emerald-400/30" };
  if (pct >= 75) return { bar: "bg-blue-500", text: "text-blue-400", ring: "border-blue-400/30" };
  if (pct >= 60) return { bar: "bg-amber-500", text: "text-amber-400", ring: "border-amber-400/30" };
  return { bar: "bg-red-500", text: "text-red-400", ring: "border-red-400/30" };
}

export default function AttendanceSummary({ attendance, compact = false }: AttendanceSummaryProps) {
  const overall = {
    total: attendance.reduce((s, a) => s + a.total, 0),
    present: attendance.reduce((s, a) => s + a.present, 0),
    absent: attendance.reduce((s, a) => s + a.absent, 0),
    leave: attendance.reduce((s, a) => s + a.leave, 0),
  };
  const overallPct = Math.round((overall.present / overall.total) * 100);
  const overallStyle = getStatusColor(overallPct);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Users size={16} className="text-emerald-500" /> Attendance
        </h3>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${overallStyle.ring} bg-slate-50`}>
          <span className={`text-sm font-bold ${overallStyle.text}`}>{overallPct}%</span>
          <span className="text-xs text-slate-400">overall</span>
        </div>
      </div>

      {/* Overall summary row */}
      {!compact && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <CheckCircle size={18} className="text-emerald-500" />
            <span className="text-lg font-bold text-slate-800">{overall.present}</span>
            <span className="text-xs text-slate-400">Present</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-50 border border-red-100">
            <XCircle size={18} className="text-red-500" />
            <span className="text-lg font-bold text-slate-800">{overall.absent}</span>
            <span className="text-xs text-slate-400">Absent</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-amber-50 border border-amber-100">
            <Clock size={18} className="text-amber-500" />
            <span className="text-lg font-bold text-slate-800">{overall.leave}</span>
            <span className="text-xs text-slate-400">Leave</span>
          </div>
        </div>
      )}

      {/* Per-subject breakdown */}
      <div className={`space-y-${compact ? 3 : 4}`}>
        {attendance.map((a) => {
          const pct = Math.round((a.present / a.total) * 100);
          const style = getStatusColor(pct);
          return (
            <div key={a.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="min-w-0 flex-1 mr-4">
                  <span className="text-sm font-medium text-slate-700 truncate block">{a.name}</span>
                  {!compact && (
                    <span className="text-xs text-slate-400">{a.code} · {a.present}/{a.total} classes</span>
                  )}
                </div>
                <span className={`text-sm font-bold tabular-nums shrink-0 ${style.text}`}>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {!compact && (
                <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="text-emerald-600/70">✓ {a.present} present</span>
                  <span className="text-red-600/70">✗ {a.absent} absent</span>
                  <span className="text-amber-600/70">⏸ {a.leave} leave</span>
                </div>
              )}
            </div>
          );
        })}
      </div>


      {/* Warning banner if < 75% */}
      {overallPct < 75 && (
        <div className="mt-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-xs text-red-300">Your overall attendance is below 75%. Contact your advisor immediately.</p>
        </div>
      )}
    </div>
  );
}
