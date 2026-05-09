import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useSession } from "@/lib/auth-client";
import { teacherApi } from "@/lib/api";
import DashboardNav from "@/components/dashboard/DashboardNav";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Search,
  Users,
  Save,
  CheckCircle2,
  Info,
  Layers,
  GraduationCap,
  Filter,
  Trash2,
  CalendarCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const YEARS = [
  "YEAR_1",
  "YEAR_2",
  "YEAR_3",
  "YEAR_4",
  "YEAR_5",
  "YEAR_6",
] as const;
type Year = (typeof YEARS)[number];

function isYear(v: string | undefined): v is Year {
  return !!v && (YEARS as readonly string[]).includes(v);
}

export default function TeacherStudentsYear() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const year = isYear(params.year) ? params.year : "YEAR_1";
  
  const subjectIdParam = searchParams.get("subjectId");
  const modeParam = searchParams.get("mode");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<string>(subjectIdParam || "");
  const [allYearSubjects, setAllYearSubjects] = useState<any[]>([]);
  const [assignmentBySubjectId, setAssignmentBySubjectId] = useState<
    Record<string, any>
  >({});
  const [arranging, setArranging] = useState(false);
  const [entryDate, setEntryDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [marksMatrix, setMarksMatrix] = useState<
    Record<string, Record<string, string>>
  >({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  
  // New Features State
  const [viewMode, setViewMode] = useState<"GRADING" | "ATTENDANCE">(
    (modeParam?.toUpperCase() as any) || "GRADING"
  );
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, "PRESENT" | "ABSENT">>(
    {}
  );
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [isAttendanceSaving, setIsAttendanceSaving] = useState(false);

  const currentSubject = useMemo(() => {
    return allYearSubjects.find(s => String(s.id) === subjectId);
  }, [allYearSubjects, subjectId]);

  useEffect(() => {
    if (!isPending) {
      if (!session) navigate("/login");
      if (session?.user.role === "STUDENT") navigate("/student");
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    if (subjectIdParam) setSubjectId(subjectIdParam);
    if (modeParam) setViewMode(modeParam.toUpperCase() as any);
  }, [subjectIdParam, modeParam]);

  useEffect(() => {
    let cancelled = false;
    async function loadSubjects() {
      if (!session) return;
      try {
        const [asgnRes, subjRes, profileRes] = await Promise.all([
          teacherApi.getAssignments(),
          teacherApi.getSubjects({ year }),
          teacherApi.getMe(),
        ]);
        if (cancelled) return;
        setTeacherProfile(profileRes.data);
        const list = Array.isArray(asgnRes.data?.assignments)
          ? asgnRes.data.assignments
          : [];
        const yearAssignments = list.filter(
          (a: any) => String(a.year) === String(year),
        );
        setSubjects(yearAssignments);
        setAllYearSubjects(Array.isArray(subjRes.data) ? subjRes.data : []);
        setAssignmentBySubjectId(
          yearAssignments.reduce((acc: Record<string, any>, a: any) => {
            if (a?.subject?.id) acc[String(a.subject.id)] = a;
            return acc;
          }, {}),
        );
        const firstSubjectId = yearAssignments[0]?.subject?.id;
        if (!subjectId && firstSubjectId) setSubjectId(String(firstSubjectId));
      } catch {
        // keep empty
      }
    }
    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, [session, year, subjectId]);

  async function toggleAssignment(sub: any) {
    const sid = String(sub.id);
    const existing = assignmentBySubjectId[sid];
    setSaveMsg(null);
    try {
      if (existing?.id) {
        // Confirmation modal logic would set deletingSubjectId
        // This function is kept for the "Add" part, but we'll use a separate delete handler for the icon
        await teacherApi.deleteAssignment(String(existing.id));
      } else {
        await teacherApi.createAssignment({ subjectId: sid, year });
      }
      await refreshAssignments();
    } catch (e: unknown) {
      setSaveMsg(
        e instanceof Error ? e.message : "Failed to update assignment.",
      );
    }
  }

  /**
   * Refetches assignments and updates local state
   */
  async function refreshAssignments() {
    const asgnRes = await teacherApi.getAssignments();
    const list = Array.isArray(asgnRes.data?.assignments)
      ? asgnRes.data.assignments
      : [];
    const yearAssignments = list.filter(
      (a: any) => String(a.year) === String(year),
    );
    setSubjects(yearAssignments);
    setAssignmentBySubjectId(
      yearAssignments.reduce((acc: Record<string, any>, a: any) => {
        if (a?.subject?.id) acc[String(a.subject.id)] = a;
        return acc;
      }, {}),
    );
    if (
      !yearAssignments.some(
        (a: any) => String(a.subject?.id) === String(subjectId),
      )
    ) {
      const nextId = yearAssignments[0]?.subject?.id;
      setSubjectId(nextId ? String(nextId) : "");
    }
  }

  /**
   * Handles Subject Deletion with Optimistic UI update
   */
  async function handleDeleteSubject(sid: string) {
    const assignment = assignmentBySubjectId[sid];
    if (!assignment?.id) return;

    setDeletingSubjectId(null);
    setSaveMsg(null);

    // Optimistic Update
    const prevAssignments = subjects;
    const prevMapping = assignmentBySubjectId;
    
    setSubjects(prev => prev.filter(a => String(a.subject?.id) !== sid));
    setAssignmentBySubjectId(prev => {
      const copy = { ...prev };
      delete copy[sid];
      return copy;
    });

    try {
      await teacherApi.deleteAssignment(String(assignment.id));
      setSaveMsg("Subject removed successfully.");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      // Rollback on error
      setSubjects(prevAssignments);
      setAssignmentBySubjectId(prevMapping);
      setSaveMsg(e instanceof Error ? e.message : "Failed to delete subject.");
    }
  }

  /**
   * Attendance Logic
   */
  function toggleAttendance(studentId: string, status: "PRESENT" | "ABSENT") {
    setAttendanceMatrix(prev => ({
      ...prev,
      [studentId]: status
    }));
  }

  async function saveAttendance() {
    if (Object.keys(attendanceMatrix).length === 0) {
      setSaveMsg("No attendance changes to save.");
      return;
    }
    
    setIsAttendanceSaving(true);
    setSaveMsg(null);
    try {
      const attendanceData = Object.entries(attendanceMatrix).map(([studentId, status]) => ({
        studentId,
        status,
        date: entryDate,
      }));
      
      await teacherApi.saveBulkAttendance({
        subjectId,
        attendanceData,
      });
      
      setSaveMsg("Attendance records synchronized successfully.");
      setAttendanceMatrix({}); // Clear local state after successful sync
      
      // Auto-hide success message
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to sync attendance.");
    } finally {
      setIsAttendanceSaving(false);
    }
  }

  // reset pagination when changing year/search
  useEffect(() => {
    setPage(1);
  }, [year]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!session) return;
      setLoading(true);
      try {
        const res = await teacherApi.getStudents({
          year,
          search: search.trim() || undefined,
          page,
          limit,
        });
        if (cancelled) return;
        
        let filteredStudents = res.data?.students ?? [];
        if (currentSubject) {
          filteredStudents = filteredStudents.filter((s: any) => s.major === currentSubject.major);
        }
        
        setStudents(filteredStudents);
        setTotal(res.data?.total ?? 0);
      } catch (e: unknown) {
        if (cancelled) return;
        console.error(e instanceof Error ? e.message : "Failed to load students.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [session, year, search, page, limit]);

  useEffect(() => {
    if (students && students.length > 0) {
      const initialMatrix: Record<string, Record<string, string>> = {};
      const initialSaved: Record<string, boolean> = {};

      students.forEach((student) => {
        const studentId = String(student.id);
        initialMatrix[studentId] = {};
        
        // If student has any results, mark the row as initially saved
        if (student.results && student.results.length > 0) {
          initialSaved[studentId] = true;
        }

        student.results?.forEach((res: any) => {
          initialMatrix[studentId][String(res.subjectId)] = String(res.marks);
        });
      });

      setMarksMatrix(initialMatrix);
      setSavedRows(initialSaved);
    }
  }, [students]);

  const yearLabel = useMemo(() => year.replace("_", " "), [year]);

  const displaySubjects = useMemo(() => {
    if (!teacherProfile || !allYearSubjects) return [];
    return allYearSubjects.filter(sub => sub.major === teacherProfile.major);
  }, [allYearSubjects, teacherProfile]);

  async function saveRow(studentId: string) {
    const studentMarks = marksMatrix[studentId];
    if (!studentMarks || Object.keys(studentMarks).length === 0) {
      setSaveMsg("No marks entered for this student.");
      return;
    }

    setSavingRows((prev) => ({ ...prev, [studentId]: true }));
    setSaveMsg(null);
    try {
      // Save each subject's mark for this student
      const promises = Object.entries(studentMarks).map(([sid, val]) => {
        const marks = Number(val);
        if (Number.isNaN(marks)) return Promise.resolve();
        return teacherApi.saveStudentMarks({
          studentId,
          subjectId: sid,
          marks,
        });
      });

      await Promise.all(promises);
      setSaveMsg(`Marks updated for student.`);
      setSavedRows((prev) => ({ ...prev, [studentId]: true }));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save marks.");
    } finally {
      setSavingRows((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50/50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <DashboardNav session={session} />

        <div className="mt-8 flex flex-col gap-8">
          {/* Page Header */}
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
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                  <GraduationCap size={14} />
                  Academic Grading
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {yearLabel} <span className="text-slate-400 font-medium">Students</span>
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or roll no..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
              <button 
                onClick={() => setArranging(!arranging)}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 px-6 rounded-2xl font-bold text-sm transition-all border shadow-sm",
                  arranging 
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-200" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <Layers size={18} />
                Manage Subjects
              </button>
            </div>
          </div>

          {/* Mode Switcher & Date Selector */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setViewMode("GRADING")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  viewMode === "GRADING" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ClipboardList size={14} />
                Grading
              </button>
              <button
                onClick={() => setViewMode("ATTENDANCE")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  viewMode === "ATTENDANCE" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <CalendarCheck size={14} />
                Attendance
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date:</span>
              <input 
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Year Navigation Chips */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
            {YEARS.map((y) => (
              <Link
                key={y}
                to={`/teacher/students/${y}`}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all",
                  y === year
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
                )}
              >
                {y.replace("_", " ")}
              </Link>
            ))}
          </div>

          {/* Subject Arrangement Tool */}
          {arranging && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-tight">
                  <Filter size={16} className="text-emerald-600" />
                  Available Subjects for {yearLabel}
                </div>
                <p className="text-xs text-slate-500 mt-1">Assign subjects to yourself to enable grade entry for your students.</p>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {displaySubjects.map((sub) => {
                    const assigned = !!assignmentBySubjectId[String(sub.id)];
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleAssignment(sub)}
                        className={cn(
                          "group flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all",
                          assigned
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        <div className="flex-1 text-left">
                          <div className="text-xs font-bold">{sub.code}</div>
                          <div className="text-[10px] opacity-80 truncate max-w-[100px]">{sub.name}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {assigned ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingSubjectId(String(sub.id));
                              }}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove Subject"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {displaySubjects.length === 0 && (
                    <div className="flex items-center gap-3 p-6 w-full rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 italic text-sm">
                      <Info size={18} />
                      No subjects found for your major in this academic year.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Table Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Student Directory</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {loading ? "Calculating..." : `${total} students enrolled`}
                  </p>
                </div>
              </div>

              {saveMsg && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold animate-in fade-in zoom-in">
                  <CheckCircle2 size={14} />
                  {saveMsg}
                </div>
              )}

              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                Page {page} of {totalPages}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
                      Student Details
                    </th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
                      Contact Info
                    </th>
                    {displaySubjects.map((sub) => (
                      <th
                        key={sub.id}
                        className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100 min-w-[140px]"
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-emerald-600">{sub.code}</span>
                          <span className="text-slate-400 font-bold truncate max-w-[100px]">{sub.name}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100 sticky right-0 bg-slate-50/90 backdrop-blur-md z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                      {viewMode === "ATTENDANCE" ? "Status Toggle" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!loading && students.map((s) => {
                    const initials = s.name ? s.name.split(' ').map((n:any) => n[0]).join('').slice(0, 2).toUpperCase() : "ST";
                    const sid_str = String(s.id);
                    const isSaving = viewMode === "GRADING" ? savingRows[sid_str] : isAttendanceSaving;
                    const isSaved = viewMode === "GRADING" ? savedRows[sid_str] : false;
                    const attendance = attendanceMatrix[sid_str];
                    
                    return (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-black flex items-center justify-center text-xs shadow-sm group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300">
                              {initials}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                {s.name}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 font-medium">
                                {s.rollNo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Phone className="size-3.5 text-slate-300" />
                              {s.phoneNumber ?? "—"}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate max-w-[200px]" title={s.address}>
                              <MapPin className="size-3.5 text-slate-300" />
                              {s.address ?? "—"}
                            </div>
                          </div>
                        </td>
                        {viewMode === "GRADING" ? (
                          displaySubjects.map((sub) => {
                            const sid = String(sub.id);
                            const value = marksMatrix[String(s.id)]?.[sid] ?? "";
                            return (
                              <td key={sub.id} className="px-6 py-6">
                                <div className="relative group/input max-w-[80px] mx-auto">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={value}
                                    onChange={(e) => {
                                      const newVal = e.target.value.replace(/[^\d.]/g, "").slice(0, 5);
                                      setMarksMatrix(prev => ({
                                        ...prev,
                                        [String(s.id)]: { ...(prev[String(s.id)] || {}), [sid]: newVal }
                                      }));
                                      if (savedRows[String(s.id)]) {
                                        setSavedRows(prev => ({ ...prev, [String(s.id)]: false }));
                                      }
                                    }}
                                    placeholder="0.0"
                                    className={cn(
                                      "h-11 w-full rounded-xl border-2 text-center text-sm font-bold outline-none transition-all shadow-sm",
                                      value 
                                        ? "bg-white border-emerald-100 text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                                        : "bg-slate-50 border-slate-100 text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    )}
                                  />
                                  {value && (
                                    <div className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                      <div className="size-1 bg-white rounded-full animate-pulse" />
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })
                        ) : (
                          <td colSpan={displaySubjects.length} className="px-8 py-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Subject: <span className="text-emerald-600">{subjects.find(sub => String(sub.subject?.id) === subjectId)?.subject?.name || "Select Subject"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                  attendance === "PRESENT" ? "bg-emerald-100 text-emerald-700" : 
                                  attendance === "ABSENT" ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-400"
                                )}>
                                  {attendance || "Pending"}
                                </span>
                              </div>
                            </div>
                          </td>
                        )}
                        
                        <td className="px-8 py-6 text-right sticky right-0 bg-white group-hover:bg-slate-50/50 backdrop-blur-md transition-colors z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                          {viewMode === "GRADING" ? (
                            <button
                              onClick={() => saveRow(String(s.id))}
                              disabled={isSaving}
                              className={cn(
                                "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95",
                                isSaved
                                  ? "bg-blue-600 text-white shadow-blue-200"
                                  : isSaving
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 hover:shadow-lg"
                              )}
                            >
                              {isSaving ? (
                                <div className="size-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />
                              ) : isSaved ? (
                                <>
                                  <CheckCircle2 size={14} />
                                  Updated
                                </>
                              ) : (
                                <>
                                  <Save size={14} />
                                  Save Result
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleAttendance(sid_str, "PRESENT")}
                                className={cn(
                                  "h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                  attendance === "PRESENT" 
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                                    : "bg-white border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                                )}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => toggleAttendance(sid_str, "ABSENT")}
                                className={cn(
                                  "h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                  attendance === "ABSENT" 
                                    ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                                    : "bg-white border border-slate-200 text-slate-400 hover:border-rose-500 hover:text-rose-500"
                                )}
                              >
                                Absent
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {!loading && students.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                  <Users size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-1">No Students Found</h4>
                <p className="text-slate-400 max-w-sm px-6">
                  {search ? `No results match your search "${search}"` : "There are no students enrolled in this academic year."}
                </p>
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="mt-6 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {/* Bulk Actions Footer */}
            {viewMode === "ATTENDANCE" && Object.keys(attendanceMatrix).length > 0 && (
              <div className="px-8 py-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={14} />
                  {Object.keys(attendanceMatrix).length} attendance records ready to save.
                </div>
                <button
                  onClick={saveAttendance}
                  disabled={isAttendanceSaving}
                  className="flex items-center gap-2 h-10 px-6 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  {isAttendanceSaving ? "Saving..." : "Save All Attendance"}
                </button>
              </div>
            )}

            {/* Pagination */}
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap bg-slate-50/30">
              <div className="text-sm font-medium text-slate-400">
                Showing <span className="text-slate-900 font-bold">{students.length}</span> of <span className="text-slate-900 font-bold">{total}</span> students
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "size-10 rounded-xl text-xs font-bold transition-all",
                          page === p ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white border border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-slate-400 px-1">...</span>}
                </div>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modals */}
      {deletingSubjectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="size-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Remove Subject?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to remove this subject from your assignments? You can always re-assign it later.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeletingSubjectId(null)}
                className="h-12 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubject(deletingSubjectId)}
                className="h-12 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
