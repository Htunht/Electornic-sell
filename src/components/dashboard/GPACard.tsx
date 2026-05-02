import { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

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

interface GPACardProps {
  gpa: number;
  grades: Grade[];
  showDetails?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-700 bg-emerald-50 border-emerald-100",
  "A":  "text-emerald-700 bg-emerald-50 border-emerald-100",
  "A-": "text-teal-700 bg-teal-50 border-teal-100",
  "B+": "text-blue-700 bg-blue-50 border-blue-100",
  "B":  "text-blue-700 bg-blue-50 border-blue-100",
  "B-": "text-indigo-700 bg-indigo-50 border-indigo-100",
  "C+": "text-amber-700 bg-amber-50 border-amber-100",
  "C":  "text-amber-700 bg-amber-50 border-amber-100",
  "F":  "text-red-700 bg-red-50 border-red-100",
};

export default function GPACard({ gpa, grades, showDetails = false }: GPACardProps) {
  const [openSemester, setOpenSemester] = useState<number | null>(1);
  const semesters = [...new Set(grades.map((g) => g.semester))].sort();

  // Distribution
  const dist = grades.reduce<Record<string, number>>((acc, g) => {
    acc[g.grade] = (acc[g.grade] ?? 0) + 1;
    return acc;
  }, {});

  const bars = [
    { label: "A+/A/A-", count: (dist["A+"] ?? 0) + (dist["A"] ?? 0) + (dist["A-"] ?? 0), color: "bg-emerald-500" },
    { label: "B+/B/B-", count: (dist["B+"] ?? 0) + (dist["B"] ?? 0) + (dist["B-"] ?? 0), color: "bg-blue-500" },
    { label: "C+/C", count:   (dist["C+"] ?? 0) + (dist["C"] ?? 0),  color: "bg-amber-500" },
    { label: "F",    count:    dist["F"] ?? 0,  color: "bg-red-500" },
  ];
  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> GPA Overview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{grades.length} subjects · {grades.reduce((s, g) => s + g.credits, 0)} credits</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-linear-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
            {gpa.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400">Cumulative GPA</div>
        </div>
      </div>

      {/* Grade distribution mini bar chart */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Grade Distribution</p>
        <div className="space-y-2">
          {bars.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">{b.label}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-50 overflow-hidden">
                <div
                  className={`h-full rounded-full ${b.color} transition-all duration-700`}
                  style={{ width: `${(b.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 w-4 text-right">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Semester accordion (only in showDetails mode or overview card) */}
      {showDetails && (
        <div className="space-y-2">
          {semesters.map((sem) => {
            const semGrades = grades.filter((g) => g.semester === sem);
            const semGPA = semGrades.reduce((s, g) => s + g.gradePoint * g.credits, 0) /
                           semGrades.reduce((s, g) => s + g.credits, 0);
            const isOpen = openSemester === sem;
            return (
              <div key={sem} className="rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenSemester(isOpen ? null : sem)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">Semester {sem}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">GPA {semGPA.toFixed(2)}</span>
                    {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 space-y-1.5 bg-slate-50/50">
                    {semGrades.map((g) => (
                      <div key={g.id} className="flex items-center justify-between py-1.5 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-medium text-slate-700">{g.name}</span>
                          <span className="ml-2 text-xs text-slate-400">{g.code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{g.marks}/100</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_COLORS[g.grade] ?? "text-slate-600"}`}>
                            {g.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

  );
}
