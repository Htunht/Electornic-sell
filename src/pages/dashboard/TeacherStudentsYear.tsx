import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
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
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

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
        await teacherApi.deleteAssignment(String(existing.id));
      } else {
        await teacherApi.createAssignment({ subjectId: sid, year });
      }
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
    } catch (e: unknown) {
      setSaveMsg(
        e instanceof Error ? e.message : "Failed to update assignment.",
      );
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

  /** 
   * TeacherStudentsYear.tsx ထဲတွင် ပြင်ရန်
   * အရင်က assignment ကိုပဲ Filter လုပ်ထားတဲ့နေရာမှာ 
   * အခု ဆရာ့ Major နဲ့တူတဲ့ ဘာသာရပ်အားလုံးကို ယူခိုင်းလိုက်ပါ
   */
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
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save marks.");
    } finally {
      setSavingRows((prev) => ({ ...prev, [studentId]: false }));
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
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                  Students
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {yearLabel}
                </div>
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
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 font-medium italic">
                    Enter marks in the table below and click save for each row.
                  </p>
                </div>
              </div>
            </div>
            {arranging && (
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Subjects available for {yearLabel}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {displaySubjects.map((sub) => {
                    const assigned = !!assignmentBySubjectId[String(sub.id)];
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleAssignment(sub)}
                        className={cn(
                          "px-3 py-2 rounded-2xl border text-xs font-semibold transition-all",
                          assigned
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200",
                        )}
                        title={sub.name}
                      >
                        {sub.code} · {String(sub.name).slice(0, 18)}
                      </button>
                    );
                  })}
                  {displaySubjects.length === 0 && (
                    <div className="text-sm text-slate-500">
                      No subjects found for your major this year.
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Click a subject to assign/unassign it for yourself (1 teacher
                  per subject per year).
                </div>
              </div>
            )}
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

            {/* Bulk Entry Table */}
            <div className="p-0 overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-100 border-collapse">
                    <thead>
                      <tr className="bg-linear-to-r from-emerald-600/90 to-green-600/90 text-white">
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">
                          Student Info
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">
                          Contact & Location
                        </th>
                        {displaySubjects.map((sub) => (
                          <th
                            key={sub.id}
                            className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest min-w-[120px]"
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-white/80 text-[8px]">
                                {sub.code}
                              </span>
                              <span className="truncate max-w-[100px]">
                                {sub.name}
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest sticky right-0 bg-emerald-600/90 backdrop-blur-md">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white/40">
                      {!loading &&
                        students.map((s) => {
                          const initial = String(s?.name ?? "S")
                            .slice(0, 1)
                            .toUpperCase();
                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-emerald-50/30 transition-colors group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="size-9 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                    {initial}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-slate-800">
                                      {s.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">
                                      {s.rollNo}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <Phone className="size-3 text-emerald-500" />
                                    {s.phoneNumber ?? "—"}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <MapPin className="size-3 text-emerald-500" />
                                    {s.address ?? "—"}
                                  </div>
                                </div>
                              </td>
                              {displaySubjects.map((sub) => {
                                const sid = String(sub.id);
                                return (
                                  <td
                                    key={sub.id}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <input
                                      inputMode="numeric"
                                      value={
                                        marksMatrix[String(s.id)]?.[sid] ?? ""
                                      }
                                      onChange={(e) =>
                                        setMarksMatrix((prev) => ({
                                          ...prev,
                                          [String(s.id)]: {
                                            ...(prev[String(s.id)] || {}),
                                            [sid]: e.target.value
                                              .replace(/[^\d.]/g, "")
                                              .slice(0, 5),
                                          },
                                        }))
                                      }
                                      placeholder="0"
                                      className="h-9 w-16 mx-auto block rounded-lg border border-slate-200/60 bg-white/80 px-2 text-center text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200/40 focus:border-emerald-400 transition-all"
                                    />
                                  </td>
                                );
                              })}
                              <td className="px-6 py-4 whitespace-nowrap text-right sticky right-0 bg-white/80 backdrop-blur-md group-hover:bg-emerald-50/80 transition-colors">
                                <button
                                  onClick={() => saveRow(String(s.id))}
                                  disabled={savingRows[String(s.id)]}
                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                                >
                                  {savingRows[String(s.id)] ? "…" : "Save"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {!loading && students.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Users size={44} className="mx-auto mb-3 opacity-20" />
                <p>No students found.</p>
              </div>
            )}

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
