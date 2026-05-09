import { useState } from "react";
import { TrendingUp, ChevronDown,  BarChart3, Layers } from "lucide-react";
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

interface GPACardProps {
  gpa: number;
  grades: Grade[];
  showDetails?: boolean;
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

export default function GPACard({ gpa, grades, showDetails = false }: GPACardProps) {
  const [openSemester, setOpenSemester] = useState<number | null>(1);
  const semesters = [...new Set(grades.map((g) => g.semester))].sort();

  // Distribution
  const dist = grades.reduce<Record<string, number>>((acc, g) => {
    acc[g.grade] = (acc[g.grade] ?? 0) + 1;
    return acc;
  }, {});

  const bars = [
    { label: "A Range", count: (dist["A+"] ?? 0) + (dist["A"] ?? 0) + (dist["A-"] ?? 0), color: "bg-emerald-500 shadow-emerald-200" },
    { label: "B Range", count: (dist["B+"] ?? 0) + (dist["B"] ?? 0) + (dist["B-"] ?? 0), color: "bg-indigo-500 shadow-indigo-200" },
    { label: "C Range", count:   (dist["C+"] ?? 0) + (dist["C"] ?? 0),  color: "bg-amber-500 shadow-amber-200" },
    { label: "Failed",    count:    dist["F"] ?? 0,  color: "bg-rose-500 shadow-rose-200" },
  ];
  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Performance Overview</h3>
            <p className="text-xs text-slate-400 font-bold">{grades.length} Subjects Completed</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-indigo-600 tracking-tight leading-none mb-1">
            {gpa.toFixed(2)}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative GPA</div>
        </div>
      </div>

      {/* Grade distribution visualization */}
      <div className="mb-10 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={16} className="text-slate-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade Distribution</p>
        </div>
        <div className="space-y-4">
          {bars.map((b) => (
            <div key={b.label} className="group cursor-default">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{b.label}</span>
                <span className="text-xs font-black text-slate-900">{b.count} Subjects</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", b.color)}
                  style={{ width: `${(b.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semester breakdown */}
      {showDetails && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Layers size={16} className="text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester Breakdown</p>
          </div>
          {semesters.map((sem) => {
            const semGrades = grades.filter((g) => g.semester === sem);
            const totalCredits = semGrades.reduce((s, g) => s + g.credits, 0);
            const semGPA = totalCredits > 0 
              ? semGrades.reduce((s, g) => s + g.gradePoint * g.credits, 0) / totalCredits 
              : 0;
            const isOpen = openSemester === sem;
            
            return (
              <div key={sem} className={cn(
                "rounded-[2rem] border transition-all duration-300",
                isOpen ? "bg-white border-emerald-100 shadow-lg shadow-emerald-50/50" : "bg-slate-50/50 border-slate-100"
              )}>
                <button
                  onClick={() => setOpenSemester(isOpen ? null : sem)}
                  className="w-full flex items-center justify-between px-6 py-5"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                      isOpen ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-white text-slate-400 border border-slate-100"
                    )}>
                      S{sem}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900">Semester {sem}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{semGrades.length} Subjects</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-600 leading-none mb-1">{semGPA.toFixed(2)}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPA</p>
                    </div>
                    <div className={cn("p-2 rounded-xl transition-all", isOpen ? "bg-emerald-50 text-emerald-500 rotate-180" : "bg-white text-slate-300 border border-slate-50")}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {semGrades.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 shadow-sm group hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            {g.code.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{g.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{g.code} · {g.credits} Units</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{g.marks}/100</span>
                          <span className={cn(
                            "min-w-[40px] text-center text-xs font-black px-2 py-1 rounded-lg border shadow-sm",
                            GRADE_COLORS[g.grade] || "text-slate-600 bg-slate-50 border-slate-200"
                          )}>
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

