import { useState } from "react";
import { Search, Filter, BookOpen, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Grade {
  id: string;
  code: string;
  name: string;
  credits: number;
  marks: number;
  grade: string;
  gradePoint: number;
  semester: number;
  status: string;
}

interface GradeTableProps {
  grades: Grade[];
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-700 bg-emerald-50 border-emerald-200",
  "A":  "text-emerald-700 bg-emerald-50 border-emerald-200",
  "A-": "text-teal-700 bg-teal-50 border-teal-200",
  "B+": "text-blue-700 bg-blue-50 border-blue-200",
  "B":  "text-blue-700 bg-blue-50 border-blue-200",
  "B-": "text-indigo-700 bg-indigo-50 border-indigo-200",
  "C+": "text-amber-700 bg-amber-50 border-amber-200",
  "C":  "text-amber-700 bg-amber-50 border-amber-200",
  "F":  "text-rose-700 bg-rose-50 border-rose-200",
};

const STATUS_CONFIG: Record<string, { color: string, icon: React.ReactNode }> = {
  APPROVED: { color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 size={12} /> },
  PENDING:  { color: "text-amber-700 bg-amber-50 border-amber-200", icon: <Clock size={12} /> },
  REJECTED: { color: "text-rose-700 bg-rose-50 border-rose-200", icon: <XCircle size={12} /> },
};

export default function GradeTable({ grades }: GradeTableProps) {
  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState<number | "all">("all");
  const semesters = [...new Set(grades.map((g) => g.semester))].sort();

  const filtered = grades.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.code.toLowerCase().includes(search.toLowerCase());
    const matchSem = semFilter === "all" || g.semester === semFilter;
    return matchSearch && matchSem;
  });

  return (
    <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Grade Records</h3>
            <p className="text-xs text-slate-400 font-bold">{filtered.length} Subjects Found</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 pr-4 text-xs font-black rounded-2xl bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 w-full md:w-56 transition-all"
            />
          </div>

          {/* Semester Filter */}
          <div className="relative flex items-center h-11 px-4 bg-white border border-slate-200 rounded-2xl">
            <Filter size={14} className="text-slate-400 mr-2" />
            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="text-xs font-black bg-transparent text-slate-700 border-0 outline-none cursor-pointer pr-4 uppercase tracking-widest"
            >
              <option value="all">All Semesters</option>
              {semesters.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {["Code", "Subject Details", "Unit", "Performance", "Grade", "Status"].map((h, i) => (
                <th key={h} className={cn(
                  "px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100",
                  i === 2 && "text-center",
                  i === 5 && "text-right"
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((g) => {
              const status = STATUS_CONFIG[g.status] || STATUS_CONFIG.PENDING;
              return (
                <tr key={g.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                      {g.code}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors mb-0.5">{g.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester {g.semester}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black text-slate-500">{g.credits}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 min-w-[120px]">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${g.marks}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-700 tabular-nums">{g.marks}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-start gap-1">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-lg text-xs font-black border shadow-sm transition-all group-hover:scale-105",
                        GRADE_COLORS[g.grade] || "text-slate-600 bg-slate-50 border-slate-200"
                      )}>
                        {g.grade}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">GPA {g.gradePoint.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest",
                      status.color
                    )}>
                      {status.icon}
                      {g.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
            <Search size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-800 mb-1">No Results Found</h4>
          <p className="text-slate-400 max-w-sm px-6 text-sm">
            We couldn't find any grades matching your current filters. Try adjusting your search term.
          </p>
        </div>
      )}

      <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Academic Summary
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Passed: {filtered.filter(g => g.grade !== "F").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-rose-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Failed: {filtered.filter(g => g.grade === "F").length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

