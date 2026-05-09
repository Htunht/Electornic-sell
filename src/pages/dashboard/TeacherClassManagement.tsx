import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSession } from "@/lib/auth-client";
import { teacherApi } from "@/lib/api";
import DashboardNav from "@/components/dashboard/DashboardNav";
import {
  ChevronLeft,
  Phone,
  Search,
  Users,
  Save,
  CheckCircle2,
  CalendarCheck,
  ClipboardList,
  Clock,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherClassManagement() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [viewMode, setViewMode] = useState<"GRADING" | "ATTENDANCE">("ATTENDANCE");
  const [entryDate, setEntryDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  
  // Grading State
  const [marksMatrix, setMarksMatrix] = useState<Record<string, string>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});
  
  // Attendance State
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [isAttendanceSaving, setIsAttendanceSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) navigate("/login");
  }, [session, isPending, navigate]);

  // Initial Load: Fetch Subject Details
  useEffect(() => {
    async function loadSubject() {
      if (!subjectId) return;
      try {
        const res = await teacherApi.getSubjects(); // Need a getSubjectById if available, otherwise filter from list
        const list = Array.isArray(res.data) ? res.data : [];
        const found = list.find((s: any) => String(s.id) === subjectId);
        if (found) setSubject(found);
      } catch (e) {
        console.error("Failed to load subject", e);
      }
    }
    loadSubject();
  }, [subjectId]);

  // Fetch Students for this subject's Year/Major
  useEffect(() => {
    let cancelled = false;
    async function loadStudents() {
      if (!subject || !session) return;
      setLoading(true);
      try {
        const res = await teacherApi.getStudents({
          year: subject.year,
          search: search.trim() || undefined,
          page,
          limit,
        });
        if (cancelled) return;
        
        // Filter by major if subject has major
        const filtered = res.data?.students?.filter((s: any) => s.major === subject.major) || [];
        setStudents(filtered);
        setTotal(res.data?.total ?? 0);

        // Pre-fill Marks Matrix
        const matrix: Record<string, string> = {};
        const saved: Record<string, boolean> = {};
        filtered.forEach((s: any) => {
          const res = s.results?.find((r: any) => String(r.subjectId) === subjectId);
          if (res) {
            matrix[String(s.id)] = String(res.marks);
            saved[String(s.id)] = true;
          }
        });
        setMarksMatrix(matrix);
        setSavedRows(saved);

      } catch (e: any) {
        if (cancelled) return;
        console.error(e.message || "Failed to load students.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadStudents();
    return () => { cancelled = true; };
  }, [subject, session, search, page, limit, subjectId]);

  // Mutations
  async function saveGrade(studentId: string) {
    const marks = Number(marksMatrix[studentId]);
    if (isNaN(marks)) return;

    setSavingRows(prev => ({ ...prev, [studentId]: true }));
    try {
      await teacherApi.saveStudentMarks({
        studentId,
        subjectId: subjectId!,
        marks,
      });
      setSavedRows(prev => ({ ...prev, [studentId]: true }));
      setSaveMsg("Grade updated successfully.");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg(e.message || "Failed to save grade.");
    } finally {
      setSavingRows(prev => ({ ...prev, [studentId]: false }));
    }
  }

  async function saveAllAttendance() {
    if (Object.keys(attendanceMatrix).length === 0) return;
    setIsAttendanceSaving(true);
    try {
      const attendanceData = Object.entries(attendanceMatrix).map(([sid, status]) => ({
        studentId: sid,
        status,
        date: entryDate,
      }));
      await teacherApi.saveBulkAttendance({
        subjectId: subjectId!,
        attendanceData,
      });
      setSaveMsg("Attendance synchronized successfully.");
      setAttendanceMatrix({});
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg(e.message || "Failed to sync attendance.");
    } finally {
      setIsAttendanceSaving(false);
    }
  }

  if (loading && !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin size-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardNav session={session!} />

        <div className="mt-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <button
                onClick={() => navigate("/teacher")}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
              >
                <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
                  <BookOpen size={14} />
                  Subject Management
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {subject?.name} <span className="text-slate-400 font-medium ml-2">{subject?.code}</span>
                </h1>
                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">
                  {subject?.year.replace('_', ' ')} · {subject?.major} Major
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setViewMode("ATTENDANCE")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  viewMode === "ATTENDANCE" ? "bg-white text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <CalendarCheck size={16} />
                Attendance
              </button>
              <button
                onClick={() => setViewMode("GRADING")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  viewMode === "GRADING" ? "bg-white text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ClipboardList size={16} />
                Grading
              </button>
            </div>

            {viewMode === "ATTENDANCE" && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date:</span>
                <input 
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Enrolled Students</h3>
                  <p className="text-xs text-slate-500 font-medium">{total} students in this subject</p>
                </div>
              </div>
              {saveMsg && (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold animate-in fade-in zoom-in">
                  {saveMsg}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5 text-left border-b border-slate-100">Student Details</th>
                    <th className="px-8 py-5 text-left border-b border-slate-100">Identification</th>
                    <th className="px-8 py-5 text-center border-b border-slate-100">
                      {viewMode === "ATTENDANCE" ? "Status Toggle" : "Grade Entry"}
                    </th>
                    <th className="px-8 py-5 text-right border-b border-slate-100 sticky right-0 bg-slate-50/90 backdrop-blur-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((s) => {
                    const sid = String(s.id);
                    const isSaving = viewMode === "GRADING" ? savingRows[sid] : false;
                    const isSaved = viewMode === "GRADING" ? savedRows[sid] : false;
                    const att = attendanceMatrix[sid];
                    
                    return (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-black flex items-center justify-center text-xs group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition-all">
                              {s.name?.[0].toUpperCase()}
                            </div>
                            <div className="font-bold text-sm text-slate-800">{s.name}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="text-xs font-mono text-slate-500">{s.rollNo}</div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <Phone size={10} /> {s.phoneNumber || "—"}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {viewMode === "ATTENDANCE" ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setAttendanceMatrix(p => ({ ...p, [sid]: "PRESENT" }))}
                                className={cn(
                                  "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                  att === "PRESENT" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                                )}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => setAttendanceMatrix(p => ({ ...p, [sid]: "ABSENT" }))}
                                className={cn(
                                  "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                  att === "ABSENT" ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "bg-white border border-slate-200 text-slate-400 hover:border-rose-500 hover:text-rose-500"
                                )}
                              >
                                Absent
                              </button>
                            </div>
                          ) : (
                            <div className="max-w-[100px] mx-auto relative group/input">
                              <input
                                type="text"
                                value={marksMatrix[sid] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d.]/g, "").slice(0, 5);
                                  setMarksMatrix(p => ({ ...p, [sid]: val }));
                                  setSavedRows(p => ({ ...p, [sid]: false }));
                                }}
                                placeholder="0.0"
                                className="h-11 w-full rounded-xl border-2 border-slate-100 text-center text-sm font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right sticky right-0 bg-white group-hover:bg-slate-50/50 backdrop-blur-md transition-colors shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                          {viewMode === "GRADING" ? (
                            <button
                              onClick={() => saveGrade(sid)}
                              disabled={isSaving}
                              className={cn(
                                "inline-flex items-center gap-2 h-10 px-5 rounded-xl text-xs font-bold transition-all",
                                isSaved ? "bg-blue-600 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"
                              )}
                            >
                              {isSaving ? <Clock size={14} className="animate-spin" /> : isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                              {isSaved ? "Saved" : "Save"}
                            </button>
                          ) : (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              att === "PRESENT" ? "text-emerald-500 bg-emerald-50" : att === "ABSENT" ? "text-rose-500 bg-rose-50" : "text-slate-300 bg-slate-50"
                            )}>
                              {att || "Pending"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attendance Bulk Save Footer */}
            {viewMode === "ATTENDANCE" && Object.keys(attendanceMatrix).length > 0 && (
              <div className="px-8 py-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={14} />
                  {Object.keys(attendanceMatrix).length} records pending synchronization.
                </div>
                <button
                  onClick={saveAllAttendance}
                  disabled={isAttendanceSaving}
                  className="h-11 px-8 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  {isAttendanceSaving ? "Syncing..." : "Sync Attendance"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
