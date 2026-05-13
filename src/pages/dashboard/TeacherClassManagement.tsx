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
  Sparkles,
  MapPin,
  LayoutDashboard,
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
  
  const [marksMatrix, setMarksMatrix] = useState<Record<string, string>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});
  
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [isAttendanceSaving, setIsAttendanceSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) navigate("/login");
  }, [session, isPending, navigate]);

  useEffect(() => {
    async function loadSubject() {
      if (!subjectId) return;
      try {
        const res = await teacherApi.getSubjects(); 
        const list = Array.isArray(res.data) ? res.data : [];
        const found = list.find((s: any) => String(s.id) === subjectId);
        if (found) setSubject(found);
      } catch (e) {
        console.error("Failed to load subject", e);
      }
    }
    loadSubject();
  }, [subjectId]);

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
        
        const filtered = res.data?.students?.filter((s: any) => s.major === subject.major) || [];
        setStudents(filtered);
        setTotal(res.data?.total ?? 0);

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

  async function saveGrade(studentId: string) {
    const marks = Number(marksMatrix[studentId]);
    if (isNaN(marks)) return;

    setSavingRows(prev => ({ ...prev, [studentId]: true }));
    try {
      await teacherApi.saveStudentMarks({
        studentId,
        subjectId: subjectId!,
        marks,
        year: subject.year,
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
        year: subject.year,
        attendanceData,
      });
      setSaveMsg("Attendance synchronized.");
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
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <DashboardNav session={session!} />

        <div className="mt-8 flex flex-col gap-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <button
                onClick={() => navigate("/teacher")}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
              >
                <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    {subject?.code || "Subject"} Management
                  </div>
                  <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                  {subject?.name || "Class Management"}
                </h1>
                <p className="text-slate-400 font-medium text-lg max-w-xl">
                  Manage academic records, attendance, and student performance for this specific class.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="relative group min-w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student identity..."
                  className="h-14 w-full rounded-[1.25rem] border-2 border-transparent bg-white pl-12 pr-6 text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tools & Control Bar */}
          <div className="flex flex-col xl:flex-row items-stretch gap-6">
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[1.25rem] w-full md:w-auto">
                {(["ATTENDANCE", "GRADING"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex-1 md:flex-none flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                      viewMode === mode 
                        ? "bg-white text-emerald-600 shadow-xl shadow-slate-200" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {mode === "ATTENDANCE" ? <CalendarCheck size={14} /> : <ClipboardList size={14} />}
                    {mode}
                  </button>
                ))}
              </div>

              {viewMode === "ATTENDANCE" && (
                <>
                  <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />
                  <div className="flex flex-col items-end pr-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Date</span>
                    <input 
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="flex items-center gap-5 px-4">
                <div className="size-12 rounded-[1.25rem] bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollment</p>
                  <p className="text-lg font-black text-slate-900">{total} <span className="text-slate-400 text-xs">Students</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="px-10 py-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-[1.75rem] bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100/50">
                  {viewMode === "ATTENDANCE" ? <CalendarCheck size={32} /> : <ClipboardList size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {viewMode === "ATTENDANCE" ? "Attendance Register" : "Grading Matrix"}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Manage student {viewMode.toLowerCase()} for the current academic session.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {saveMsg && (
                  <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 animate-in slide-in-from-right-4">
                    <Sparkles size={14} />
                    {saveMsg}
                  </div>
                )}
                {viewMode === "ATTENDANCE" && Object.keys(attendanceMatrix).length > 0 && (
                  <button
                    onClick={saveAllAttendance}
                    disabled={isAttendanceSaving}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isAttendanceSaving ? <Clock className="animate-spin size-4" /> : <Save size={18} />}
                    Sync {Object.keys(attendanceMatrix).length} Records
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Identity & Details
                    </th>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Academic Context
                    </th>
                    <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {viewMode === "ATTENDANCE" ? "Status Toggle" : "Performance Entry"}
                    </th>
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sticky right-0 bg-slate-50 z-10">
                      Operations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!loading && students.map((s, idx) => {
                    const sid = String(s.id);
                    const isSaving = viewMode === "GRADING" ? savingRows[sid] : false;
                    const isSaved = viewMode === "GRADING" ? savedRows[sid] : false;
                    const att = attendanceMatrix[sid];
                    const initials = s.name ? s.name.split(' ').map((n:any) => n[0]).join('').slice(0, 2).toUpperCase() : "ST";
                    
                    return (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="size-14 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-black flex items-center justify-center text-sm shadow-xl shadow-slate-200/50 group-hover:from-emerald-600 group-hover:to-emerald-800 group-hover:text-white transition-all duration-500">
                                {initials}
                              </div>
                              <div className="absolute -top-1 -left-1 size-5 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors">
                                {idx + 1}
                              </div>
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                                {s.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.rollNo}</span>
                                <div className="size-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-400">{s.major}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-bold">
                              <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <Phone size={14} />
                              </div>
                              {s.phoneNumber || "No contact"}
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-bold truncate max-w-[180px]">
                              <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                <MapPin size={14} />
                              </div>
                              {s.address || "No address"}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          {viewMode === "ATTENDANCE" ? (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => setAttendanceMatrix(p => ({ ...p, [sid]: "PRESENT" }))}
                                className={cn(
                                  "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-90",
                                  att === "PRESENT" 
                                    ? "bg-emerald-500 text-white shadow-emerald-200" 
                                    : "bg-white border-2 border-slate-100 text-slate-300 hover:border-emerald-500 hover:text-emerald-500"
                                )}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => setAttendanceMatrix(p => ({ ...p, [sid]: "ABSENT" }))}
                                className={cn(
                                  "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-90",
                                  att === "ABSENT" 
                                    ? "bg-rose-500 text-white shadow-rose-200" 
                                    : "bg-white border-2 border-slate-100 text-slate-300 hover:border-rose-500 hover:text-rose-500"
                                )}
                              >
                                Absent
                              </button>
                            </div>
                          ) : (
                            <div className="max-w-[120px] mx-auto relative group/input">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={marksMatrix[sid] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d.]/g, "").slice(0, 5);
                                  setMarksMatrix(p => ({ ...p, [sid]: val }));
                                  setSavedRows(p => ({ ...p, [sid]: false }));
                                }}
                                placeholder="00.0"
                                className={cn(
                                  "h-14 w-full rounded-2xl border-2 text-center text-base font-black outline-none transition-all shadow-lg shadow-slate-100",
                                  marksMatrix[sid]
                                    ? "bg-white border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/5" 
                                    : "bg-slate-50 border-slate-100 text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                                )}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 transition-colors">
                          {viewMode === "GRADING" ? (
                            <button
                              onClick={() => saveGrade(sid)}
                              disabled={isSaving}
                              className={cn(
                                "relative overflow-hidden inline-flex items-center justify-center gap-3 h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
                                isSaved
                                  ? "bg-indigo-600 text-white shadow-indigo-200"
                                  : isSaving
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                              )}
                            >
                              <div className={cn("flex items-center gap-2 transition-all", isSaving ? "opacity-0" : "opacity-100")}>
                                {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                                {isSaved ? "Synced" : "Save Row"}
                              </div>
                              {isSaving && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Clock className="size-5 animate-spin" />
                                </div>
                              )}
                            </button>
                          ) : (
                            <div className="flex flex-col items-end pr-2">
                              <span className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                att === "PRESENT" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : 
                                att === "ABSENT" ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-400"
                              )}>
                                {att || "No Entry"}
                              </span>
                              {att && <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Selected</p>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && students.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="size-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border-2 border-dashed border-slate-100">
                  <LayoutDashboard size={48} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">No Students Enrolled</h4>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">
                  There are no students found for this major and academic year. Please check your faculty assignments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
