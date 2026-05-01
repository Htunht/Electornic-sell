import { useState } from "react";
import { Search, Filter } from "lucide-react";

interface Grade {
  id: number;
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
  "A+": "text-emerald-700 bg-emerald-50 border-emerald-100",
  "A":  "text-emerald-700 bg-emerald-50 border-emerald-100",
  "A-": "text-teal-700 bg-teal-50 border-teal-100",
  "B+": "text-blue-700 bg-blue-50 border-blue-100",
  "B":  "text-blue-700 bg-blue-50 border-blue-100",
  "C+": "text-amber-700 bg-amber-50 border-amber-100",
  "C":  "text-amber-700 bg-amber-50 border-amber-100",
  "F":  "text-red-700 bg-red-50 border-red-100",
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "text-emerald-700 bg-emerald-50 border-emerald-100",
  PENDING:  "text-amber-700 bg-amber-50 border-amber-100",
  REJECTED: "text-red-700 bg-red-50 border-red-100",
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-slate-800">Grade Results</h3>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 w-44 transition-colors"
            />
          </div>
          {/* Semester Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
            <Filter size={12} className="text-slate-400" />
            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="text-sm bg-transparent text-slate-600 border-0 outline-none cursor-pointer"
            >
              <option value="all">All</option>
              {semesters.map((s) => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr>
              {["Code", "Subject", "Credits", "Marks", "Grade", "GPA Pt.", "Status"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider first:pl-4 last:pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((g, i) => (
              <tr key={g.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-3 py-3.5 pl-4 font-mono text-xs text-emerald-600 font-medium">{g.code}</td>
                <td className="px-3 py-3.5 text-slate-700 font-medium max-w-[200px] truncate">{g.name}</td>
                <td className="px-3 py-3.5 text-slate-400 text-center">{g.credits}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[60px] h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                        style={{ width: `${g.marks}%` }}
                      />
                    </div>
                    <span className="text-slate-600 font-medium tabular-nums">{g.marks}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${GRADE_COLORS[g.grade] ?? "text-slate-600"}`}>
                    {g.grade}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-slate-500 tabular-nums text-center">{g.gradePoint.toFixed(1)}</td>
                <td className="px-3 py-3.5 pr-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[g.status] ?? "text-slate-400"}`}>
                    {g.status === "APPROVED" ? "✓ " : g.status === "PENDING" ? "⏳ " : "✗ "}
                    {g.status.charAt(0) + g.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">No subjects match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

  );
}
