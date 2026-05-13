import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useSession } from "@/lib/auth-client";
import { headTeacherApi } from "@/lib/api";
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
  Layers,
  Trash2,
  CalendarCheck,
  ClipboardList,
  AlertCircle,
  Sparkles,
  Clock,
  LayoutDashboard,
  Plus,
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

export default function HeadTeacherStudentsYear() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const year = isYear(params.year) ? params.year : "YEAR_1";

  const subjectIdParam = searchParams.get("subjectId");
  const modeParam = searchParams.get("mode");
  const semesterParam = searchParams.get("semester");

  const [semester, setSemester] = useState<number>(Number(semesterParam) || 1);
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

  const [viewMode, setViewMode] = useState<"GRADING" | "ATTENDANCE">(
    (modeParam?.toUpperCase() as any) || "GRADING",
  );
  const [attendanceMatrix, setAttendanceMatrix] = useState<
    Record<string, "PRESENT" | "ABSENT">
  >({});
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(
    null,
  );
  const [isAttendanceSaving, setIsAttendanceSaving] = useState(false);

  const currentSubject = useMemo(() => {
    return allYearSubjects.find((s) => String(s.id) === subjectId);
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
    if (semesterParam) setSemester(Number(semesterParam));
  }, [subjectIdParam, modeParam, semesterParam]);

  useEffect(() => {
    let cancelled = false;
    async function loadSubjects() {
      if (!session) return;
      try {
        const [asgnRes, subjRes, profileRes] = await Promise.all([
          headTeacherApi.getAssignments(),
          headTeacherApi.getSubjects({ year }),
          headTeacherApi.getMe(),
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
        await headTeacherApi.deleteAssignment(String(existing.id));
      } else {
        await headTeacherApi.createAssignment({ subjectId: sid, year });
      }
      await refreshAssignments();
    } catch (e: unknown) {
      setSaveMsg(
        e instanceof Error ? e.message : "Failed to update assignment.",
      );
    }
  }

  async function refreshAssignments() {
    const asgnRes = await headTeacherApi.getAssignments();
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

  async function handleDeleteSubject(sid: string) {
    const assignment = assignmentBySubjectId[sid];
    if (!assignment?.id) return;

    setDeletingSubjectId(null);
    setSaveMsg(null);

    const prevAssignments = subjects;
    const prevMapping = assignmentBySubjectId;

    setSubjects((prev) => prev.filter((a) => String(a.subject?.id) !== sid));
    setAssignmentBySubjectId((prev) => {
      const copy = { ...prev };
      delete copy[sid];
      return copy;
    });

    try {
      await headTeacherApi.deleteAssignment(String(assignment.id));
      setSaveMsg("Subject removed successfully.");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      setSubjects(prevAssignments);
      setAssignmentBySubjectId(prevMapping);
      setSaveMsg(e instanceof Error ? e.message : "Failed to delete subject.");
    }
  }

  function toggleAttendance(studentId: string, status: "PRESENT" | "ABSENT") {
    setAttendanceMatrix((prev) => ({
      ...prev,
      [studentId]: status,
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
      const attendanceData = Object.entries(attendanceMatrix).map(
        ([studentId, status]) => ({
          studentId,
          status,
          date: entryDate,
        }),
      );

      await headTeacherApi.saveBulkAttendance({
        subjectId,
        year,
        attendanceData,
      });

      setSaveMsg("Attendance records synchronized.");
      setAttendanceMatrix({});
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to sync attendance.");
    } finally {
      setIsAttendanceSaving(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [year]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!session) return;
      setLoading(true);
      try {
        const res = await headTeacherApi.getStudents({
          year,
          search: search.trim() || undefined,
          page,
          limit,
        });
        if (cancelled) return;

        let filteredStudents = res.data?.students ?? [];
        if (currentSubject) {
          filteredStudents = filteredStudents.filter(
            (s: any) => s.major === currentSubject.major,
          );
        }

        setStudents(filteredStudents);
        setTotal(res.data?.total ?? 0);
      } catch (e: unknown) {
        if (cancelled) return;
        console.error(
          e instanceof Error ? e.message : "Failed to load students.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [session, year, search, page, limit, subjectId]);

  useEffect(() => {
    if (students && students.length > 0) {
      const initialMatrix: Record<string, Record<string, string>> = {};
      const initialSaved: Record<string, boolean> = {};

      students.forEach((student) => {
        const studentId = String(student.id);
        initialMatrix[studentId] = {};
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
    return allYearSubjects.filter(
      (sub) => (sub.semester === semester || !sub.semester)
    );
  }, [allYearSubjects, teacherProfile, semester]);

  async function saveRow(studentId: string) {
    const studentMarks = marksMatrix[studentId];
    if (!studentMarks || Object.keys(studentMarks).length === 0) {
      setSaveMsg("No marks entered.");
      return;
    }

    setSavingRows((prev) => ({ ...prev, [studentId]: true }));
    setSaveMsg(null);
    try {
      const promises = Object.entries(studentMarks).map(([sid, val]) => {
        const marks = Number(val);
        if (Number.isNaN(marks)) return Promise.resolve();
        return headTeacherApi.saveStudentMarks({
          studentId,
          subjectId: sid,
          marks,
          year,
        });
      });

      await Promise.all(promises);
      setSaveMsg(`Marks updated.`);
      setSavedRows((prev) => ({ ...prev, [studentId]: true }));
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save marks.");
    } finally {
      setSavingRows((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <DashboardNav session={session!} />

        <div className="mt-8 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <button
                onClick={() => navigate("/head-teacher")}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
              >
                <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    Academic Year {yearLabel}
                  </div>
                  <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                  Student{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                    Registry
                  </span>
                </h1>
                <p className="text-slate-400 font-medium text-lg max-w-xl">
                  Administrative portal for managing grades, attendance, and
                  student performance records.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="relative group min-w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or roll number..."
                  className="h-14 w-full rounded-[1.25rem] border-2 border-transparent bg-white pl-12 pr-6 text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                />
              </div>
              <button
                onClick={() => setArranging(!arranging)}
                className={cn(
                  "flex items-center justify-center gap-3 h-14 px-8 rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all border shadow-xl active:scale-95",
                  arranging
                    ? "bg-slate-900 border-slate-900 text-white shadow-indigo-200"
                    : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50",
                )}
              >
                <Layers size={18} />
                Control List
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-stretch gap-6">
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[1.25rem] w-full md:w-auto">
                {(["GRADING", "ATTENDANCE"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                      viewMode === mode
                        ? "bg-white text-emerald-600 shadow-xl shadow-slate-200"
                        : "text-slate-400 hover:text-slate-600",
                    )}
                  >
                    {mode === "GRADING" ? (
                      <ClipboardList size={14} />
                    ) : (
                      <CalendarCheck size={14} />
                    )}
                    {mode}
                  </button>
                ))}
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />

              <div className="flex flex-wrap items-center gap-2">
                {YEARS.map((y) => (
                  <Link
                    key={y}
                    to={`/head-teacher/students/${y}?semester=${semester}&mode=${viewMode.toLowerCase()}`}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      y === year
                        ? "bg-slate-900 text-white shadow-lg"
                        : "bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {y.split("_")[1]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[1.25rem]">
                {[1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSemester(s);
                      navigate(
                        `/head-teacher/students/${year}?semester=${s}&mode=${viewMode.toLowerCase()}`,
                      );
                    }}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                      semester === s
                        ? "bg-white text-indigo-600 shadow-xl shadow-slate-200"
                        : "text-slate-400 hover:text-slate-600",
                    )}
                  >
                    S{s}
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-end pr-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Entry Date
                </span>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {arranging && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden animate-in slide-in-from-top-6 duration-500">
              <div className="px-10 py-8 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    <Sparkles size={12} />
                    Configuration Tool
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Manage Controlled Subjects
                  </h3>
                </div>
                <button
                  onClick={() => setArranging(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <ChevronRight size={20} className="rotate-90" />
                </button>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displaySubjects.map((sub) => {
                    const assigned = !!assignmentBySubjectId[String(sub.id)];
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleAssignment(sub)}
                        className={cn(
                          "group relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300",
                          assigned
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50/30",
                        )}
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {sub.code}
                          </p>
                          <p className="text-sm font-black leading-tight truncate">
                            {sub.name}
                          </p>
                        </div>
                        <div className="absolute top-4 right-4">
                          {assigned ? (
                            <div className="size-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 animate-in zoom-in duration-300">
                              <CheckCircle2 size={16} />
                            </div>
                          ) : (
                            <div className="size-7 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center border border-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors">
                              <Plus size={16} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {displaySubjects.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <LayoutDashboard
                        size={40}
                        className="text-slate-200 mb-4"
                      />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No subjects found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="px-10 py-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-[1.75rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100/50">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Active Enrollment
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Showing{" "}
                    <span className="text-indigo-600 font-bold">
                      {students.length}
                    </span>{" "}
                    students across all majors
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
                {viewMode === "ATTENDANCE" && students.length > 0 && (
                  <button
                    onClick={saveAttendance}
                    disabled={isAttendanceSaving}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isAttendanceSaving ? (
                      <Clock className="animate-spin size-4" />
                    ) : (
                      <Save size={18} />
                    )}
                    Sync Attendance
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Identity & Roll
                    </th>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Access Info
                    </th>
                    {displaySubjects.map((sub) => (
                      <th
                        key={sub.id}
                        className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[160px]"
                      >
                        <div className="space-y-1">
                          <p className="text-emerald-600">{sub.code}</p>
                          <p className="truncate max-w-[120px] mx-auto opacity-60 font-bold">
                            {sub.name}
                          </p>
                        </div>
                      </th>
                    ))}
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sticky right-0 bg-slate-50 z-10">
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!loading &&
                    students.map((s, idx) => {
                      const initials = s.name
                        ? s.name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "ST";
                      const sid_str = String(s.id);
                      const isSaving =
                        viewMode === "GRADING" ? savingRows[sid_str] : false;
                      const isSaved =
                        viewMode === "GRADING" ? savedRows[sid_str] : false;
                      const attendance = attendanceMatrix[sid_str];

                      return (
                        <tr
                          key={s.id}
                          className="group hover:bg-slate-50/50 transition-all duration-300"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="relative">
                                <div className="size-14 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-black flex items-center justify-center text-sm shadow-xl shadow-slate-200/50 group-hover:from-indigo-600 group-hover:to-indigo-800 group-hover:text-white transition-all duration-500">
                                  {initials}
                                </div>
                                <div className="absolute -top-1 -left-1 size-5 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                                  {idx + 1 + (page - 1) * limit}
                                </div>
                              </div>
                              <div>
                                <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {s.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {s.rollNo}
                                  </span>
                                  <div className="size-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {s.major}
                                  </span>
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
                                {s.phoneNumber ?? "No data"}
                              </div>
                              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-bold truncate max-w-[180px]">
                                <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                  <MapPin size={14} />
                                </div>
                                {s.address ?? "No data"}
                              </div>
                            </div>
                          </td>
                          {viewMode === "GRADING" ? (
                            displaySubjects.map((sub) => {
                              const sid = String(sub.id);
                              const value =
                                marksMatrix[String(s.id)]?.[sid] ?? "";
                              return (
                                <td key={sub.id} className="px-6 py-8">
                                  <div className="relative group/input max-w-[100px] mx-auto">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={value}
                                      onChange={(e) => {
                                        const newVal = e.target.value
                                          .replace(/[^\d.]/g, "")
                                          .slice(0, 5);
                                        setMarksMatrix((prev) => ({
                                          ...prev,
                                          [String(s.id)]: {
                                            ...(prev[String(s.id)] || {}),
                                            [sid]: newVal,
                                          },
                                        }));
                                        if (savedRows[String(s.id)]) {
                                          setSavedRows((prev) => ({
                                            ...prev,
                                            [String(s.id)]: false,
                                          }));
                                        }
                                      }}
                                      placeholder="00.0"
                                      className={cn(
                                        "h-14 w-full rounded-2xl border-2 text-center text-base font-black outline-none transition-all shadow-lg shadow-slate-100",
                                        value
                                          ? "bg-white border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/5"
                                          : "bg-slate-50 border-slate-100 text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5",
                                      )}
                                    />
                                  </div>
                                </td>
                              );
                            })
                          ) : (
                            <td
                              colSpan={displaySubjects.length}
                              className="px-10 py-8"
                            >
                              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all duration-500">
                                <div className="flex items-center gap-4">
                                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                    <CalendarCheck size={20} />
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      Target Subject
                                    </p>
                                    <p className="text-sm font-black text-slate-800">
                                      {allYearSubjects.find(
                                        (sub) => String(sub.id) === subjectId,
                                      )?.name || "Select Subject"}
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    attendance === "PRESENT"
                                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                      : attendance === "ABSENT"
                                        ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                                        : "bg-slate-200 text-slate-500",
                                  )}
                                >
                                  {attendance || "Pending"}
                                </div>
                              </div>
                            </td>
                          )}

                          <td className="px-10 py-8 text-right sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 transition-colors">
                            {viewMode === "GRADING" ? (
                              <button
                                onClick={() => saveRow(String(s.id))}
                                disabled={isSaving}
                                className={cn(
                                  "relative overflow-hidden inline-flex items-center justify-center gap-3 h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
                                  isSaved
                                    ? "bg-indigo-600 text-white shadow-indigo-200"
                                    : isSaving
                                      ? "bg-slate-100 text-slate-400 cursor-wait"
                                      : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex items-center gap-2 transition-all",
                                    isSaving ? "opacity-0" : "opacity-100",
                                  )}
                                >
                                  {isSaved ? (
                                    <CheckCircle2 size={16} />
                                  ) : (
                                    <Save size={16} />
                                  )}
                                  {isSaved ? "Synced" : "Save Row"}
                                </div>
                                {isSaving && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Clock className="size-5 animate-spin" />
                                  </div>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() =>
                                    toggleAttendance(sid_str, "PRESENT")
                                  }
                                  className={cn(
                                    "size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90",
                                    attendance === "PRESENT"
                                      ? "bg-emerald-500 text-white shadow-emerald-200"
                                      : "bg-white border-2 border-slate-100 text-slate-300 hover:border-emerald-500 hover:text-emerald-500",
                                  )}
                                >
                                  <CheckCircle2 size={24} />
                                </button>
                                <button
                                  onClick={() =>
                                    toggleAttendance(sid_str, "ABSENT")
                                  }
                                  className={cn(
                                    "size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90",
                                    attendance === "ABSENT"
                                      ? "bg-rose-500 text-white shadow-rose-200"
                                      : "bg-white border-2 border-slate-100 text-slate-300 hover:border-rose-500 hover:text-rose-500",
                                  )}
                                >
                                  <Trash2 size={24} />
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
                <h4 className="text-xl font-bold text-slate-800 mb-1">
                  No Students Found
                </h4>
                <p className="text-slate-400 max-w-sm px-6">
                  {search
                    ? `No results match your search "${search}"`
                    : "There are no students enrolled in this academic year."}
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
            {viewMode === "ATTENDANCE" &&
              Object.keys(attendanceMatrix).length > 0 && (
                <div className="px-8 py-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={14} />
                    {Object.keys(attendanceMatrix).length} attendance records
                    ready to save.
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
                Showing{" "}
                <span className="text-slate-900 font-bold">
                  {students.length}
                </span>{" "}
                of <span className="text-slate-900 font-bold">{total}</span>{" "}
                students
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
                          page === p
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                            : "bg-white border border-slate-100 text-slate-500 hover:border-slate-200",
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="text-slate-400 px-1">...</span>
                  )}
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
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Remove Subject?
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to remove this subject from your
              assignments? You can always re-assign it later.
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
