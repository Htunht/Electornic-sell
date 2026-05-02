import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSession } from "@/lib/auth-client";
import { teacherApi } from "@/lib/api";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { ChevronLeft, ChevronRight, GraduationCap, MapPin, Phone, Search, Users, ClipboardCheck, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const YEARS = ["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"] as const;
type Year = (typeof YEARS)[number];

function isYear(v: string | undefined): v is Year {
  return !!v && (YEARS as readonly string[]).includes(v);
}

export default function TeacherStudentsYear() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const year = isYear(params.year) ? params.year : "YEAR_1";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [entryDate, setEntryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [marksByStudentId, setMarksByStudentId] = useState<Record<string, string>>({});
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">>({});
  const [savingResults, setSavingResults] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) {
      if (!session) navigate("/login");
      if (session?.user.role === "STUDENT") navigate("/student");
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    let cancelled = false;
    async function loadSubjects() {
      if (!session) return;
      try {
        const res = await teacherApi.getAssignments();
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setSubjects(list);
        if (!subjectId && list[0]?.id) setSubjectId(String(list[0].id));
      } catch {
        // keep empty
      }
    }
    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, [session, subjectId]);

  // reset pagination when changing year/search
  useEffect(() => {
    setPage(1);
  }, [year]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!session) return;
      setLoading(true);
      setError(null);
      try {
        const res = await teacherApi.getStudents({
          year,
          search: search.trim() || undefined,
          page,
          limit,
        });
        if (cancelled) return;
        setStudents(res.data?.students ?? []);
        setTotal(res.data?.total ?? 0);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load students.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [session, year, search, page, limit]);

  const yearLabel = useMemo(() => year.replace("_", " "), [year]);

  async function saveResults() {
    if (!subjectId) {
      setSaveMsg("Select a subject first.");
      return;
    }
    const records = students
      .map((s) => {
        const v = marksByStudentId[String(s.id)];
        const marks = v === "" || v === undefined ? null : Number(v);
        if (marks === null || Number.isNaN(marks)) return null;
        return { studentId: String(s.id), marks };
      })
      .filter(Boolean) as { studentId: string; marks: number }[];

    if (records.length === 0) {
      setSaveMsg("No marks to save on this page.");
      return;
    }

    setSavingResults(true);
    setSaveMsg(null);
    try {
      await teacherApi.bulkUpsertResults({
        subjectId,
        year,
        records,
        semester: 1,
        academicYear: "2025-2026",
      });
      setSaveMsg("Results saved.");
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save results.");
    } finally {
      setSavingResults(false);
    }
  }

  async function saveAttendance() {
    if (!subjectId) {
      setSaveMsg("Select a subject first.");
      return;
    }
    const records = students.map((s) => ({
      studentId: String(s.id),
      status: attendanceByStudentId[String(s.id)] ?? "PRESENT",
    }));

    setSavingAttendance(true);
    setSaveMsg(null);
    try {
      await teacherApi.bulkUpsertAttendance({
        subjectId,
        year,
        date: new Date(entryDate).toISOString(),
        records,
      });
      setSaveMsg("Attendance saved.");
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save attendance.");
    } finally {
      setSavingAttendance(false);
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/30 border-b-emerald-500/10 border-l-emerald-500/50 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-white text-slate-900 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-emerald-200/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-green-100/30 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <DashboardNav session={session} />

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/teacher")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="size-4" />
                Teacher dashboard
              </button>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Students</div>
                <div className="text-2xl font-bold text-slate-800">{yearLabel}</div>
              </div>
            </div>

            <div className="w-full sm:w-[420px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search… (name or rollNo)"
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200/60 focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Year pagination bar (no dropdown) */}
          <div className="flex flex-wrap gap-2">
            {YEARS.map((y) => (
              <Link
                key={y}
                to={`/teacher/students/${y}`}
                className={cn(
                  "px-4 py-2 rounded-2xl text-sm font-semibold border transition-all",
                  y === year
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200",
                )}
              >
                {y.replace("_", " ")}
              </Link>
            ))}
          </div>

          {/* Manual entry tools */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Manual Entry</div>
                  <div className="text-xs text-slate-500">
                    Enter marks & attendance for this year (page-by-page).
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                {/* Subject pills */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {subjects.slice(0, 12).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSubjectId(String(sub.id))}
                      className={cn(
                        "shrink-0 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all",
                        String(sub.id) === subjectId
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200",
                      )}
                      title={sub.name}
                    >
                      {sub.code ?? "SUB"} · {String(sub.name ?? "Subject").slice(0, 14)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200/60 focus:border-emerald-400"
                  />
                  <button
                    onClick={saveResults}
                    disabled={savingResults || !subjectId}
                    className="h-10 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <BookOpen className="size-4" />
                    {savingResults ? "Saving…" : "Save marks"}
                  </button>
                  <button
                    onClick={saveAttendance}
                    disabled={savingAttendance || !subjectId}
                    className="h-10 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ClipboardCheck className="size-4 text-emerald-600" />
                    {savingAttendance ? "Saving…" : "Save attendance"}
                  </button>
                </div>
              </div>
            </div>
            {saveMsg && (
              <div className="px-6 py-3 text-sm text-slate-700 bg-emerald-50 border-b border-emerald-100">
                {saveMsg}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Users className="size-4 text-emerald-600" />
                {loading ? "Loading…" : `${total} students`}
              </div>
              <div className="text-xs text-slate-400">
                Page {page} / {totalPages}
              </div>
            </div>

            {error && (
              <div className="px-6 py-4 text-sm text-destructive bg-destructive/5 border-b border-destructive/20">
                {error}
              </div>
            )}

            {/* Cards */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {!loading &&
                students.map((s) => {
                  const initial = String(s?.name ?? "S").slice(0, 1).toUpperCase();
                  return (
                    <div
                      key={s.id}
                      className="group rounded-3xl border border-slate-200/70 bg-linear-to-br from-white to-emerald-50/40 p-5 hover:shadow-md hover:shadow-emerald-100 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-11 rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 text-white font-bold flex items-center justify-center shadow-sm shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">{s.name}</div>
                            <div className="text-xs text-slate-500 font-mono truncate">{s.rollNo}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          {String(s.year ?? "").replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-emerald-600" />
                          <span className="truncate">{s.major}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-emerald-600" />
                          <span className="truncate">{s.phoneNumber ?? "—"}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <MapPin className="size-4 text-emerald-600" />
                          <span className="truncate">{s.address ?? "—"}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Marks
                          </div>
                          <input
                            inputMode="numeric"
                            value={marksByStudentId[String(s.id)] ?? ""}
                            onChange={(e) =>
                              setMarksByStudentId((prev) => ({
                                ...prev,
                                [String(s.id)]: e.target.value.replace(/[^\d.]/g, "").slice(0, 5),
                              }))
                            }
                            placeholder="0-100"
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200/60 focus:border-emerald-400"
                          />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Attendance
                          </div>
                          <select
                            value={attendanceByStudentId[String(s.id)] ?? "PRESENT"}
                            onChange={(e) =>
                              setAttendanceByStudentId((prev) => ({
                                ...prev,
                                [String(s.id)]: e.target.value as any,
                              }))
                            }
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200/60 focus:border-emerald-400"
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                            <option value="EXCUSED">Excused</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {!loading && students.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <Users size={44} className="mx-auto mb-3 opacity-20" />
                  <p>No students found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs text-slate-400">
                Showing {students.length} of {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

