import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import StudentProfile from "../../components/dashboard/StudentProfile";
import GPACard from "../../components/dashboard/GPACard";
import GradeTable from "../../components/dashboard/GradeTable";
import AttendanceSummary from "../../components/dashboard/AttendanceSummary";
import CalendarWidget from "../../components/dashboard/CalendarWidget";
import DashboardNav from "../../components/dashboard/DashboardNav";
import CompleteStudentProfileCard from "../../components/dashboard/CompleteStudentProfileCard";
import { studentApi, calendarApi } from "../../lib/api";

// ─── Student Dashboard ────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "grades" | "attendance"
  >("overview");

  const [studentData, setStudentData] = useState<unknown>(null);
  const [results, setResults] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [attendanceRaw, setAttendanceRaw] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = async () => {
    const [profileRes, resultsRes, eventsRes, attendanceRes] = await Promise.all([
      studentApi.getMe(),
      studentApi.getResults(),
      calendarApi.getEvents(),
      studentApi.getAttendance(),
    ]);
    setStudentData(profileRes.data);
    setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    setEvents(eventsRes.data?.events || []);
    setAttendanceRaw(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
  };

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        navigate("/login");
      } else if (session.user.role !== "STUDENT") {
        navigate("/teacher");
      }
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          await refreshAll();
        } catch (error) {
          console.error("Error fetching student data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/30 border-b-emerald-500/10 border-l-emerald-500/50 animate-spin" />
          <p className="text-emerald-600 text-sm font-medium tracking-wider animate-pulse">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (!session || !studentData) return null;

  const student = studentData as {
    rollNo?: string;
    name?: string;
    major?: string;
    year?: string;
    phoneNumber?: string | null;
    address?: string | null;
  };

  // Calculate GPA from real results
  const typedResults = results as Array<{
    gradePoint?: number;
    semester?: number;
    academicYear?: string;
    subject?: { code?: string; name?: string; creditHours?: number };
  }>;

  const totalGradePoints = typedResults.reduce(
    (acc, r) => acc + (r.gradePoint ?? 0) * (r.subject?.creditHours ?? 0),
    0,
  );
  const totalCredits = typedResults.reduce(
    (acc, r) => acc + (r.subject?.creditHours ?? 0),
    0,
  );
  const currentGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  const profileInfo = {
    rollNo: student.rollNo ?? "",
    name: student.name ?? "",
    major: student.major ?? "",
    year: student.year ?? "",
    email: session.user.email,
    phone: student.phoneNumber || "N/A",
    gpa: currentGPA,
    totalCredits: totalCredits,
    semester: typedResults[0]?.semester || 1,
    academicYear: typedResults[0]?.academicYear || "2025-2026",
  };

  const needsProfile =
    !student.rollNo || !student.year || !student.phoneNumber || !student.address;

  const formattedGrades = (typedResults as Array<any>).map((r, idx) => ({
    id: String(r.id ?? idx),
    code: r.subject?.code || "N/A",
    name: r.subject?.name || "N/A",
    credits: r.subject?.creditHours || 0,
    marks: r.marks ?? 0,
    grade: r.grade ?? "N/A",
    gradePoint: r.gradePoint ?? 0,
    semester: r.semester ?? 1,
    status: r.status ?? "APPROVED",
  }));

  // Convert raw attendance rows into AttendanceSummary format (per subject)
  type AttendanceSummaryRow = {
    id: string;
    code: string;
    name: string;
    total: number;
    present: number;
    absent: number;
    leave: number;
  };

  const typedAttendance = attendanceRaw as Array<{
    subjectId?: string;
    status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    subject?: { code?: string; name?: string };
  }>;

  const attendanceSummary = Object.values(
    typedAttendance.reduce<Record<string, AttendanceSummaryRow>>((acc, row) => {
      const key = row.subjectId ?? "unknown";
      if (!acc[key]) {
        acc[key] = {
          id: key,
          code: row.subject?.code ?? "N/A",
          name: row.subject?.name ?? "Unknown Subject",
          total: 0,
          present: 0,
          absent: 0,
          leave: 0,
        };
      }
      acc[key].total += 1;
      if (row.status === "PRESENT") acc[key].present += 1;
      else if (row.status === "ABSENT") acc[key].absent += 1;
      else acc[key].leave += 1;
      return acc;
    }, {}),
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-white text-slate-900 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-emerald-200/20 blur-[130px]" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-green-200/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-100/30 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <DashboardNav session={session} />

        <div className="mt-6">
          {needsProfile && (
            <CompleteStudentProfileCard
              initialRollNo={student.rollNo}
              initialYear={student.year}
              initialPhoneNumber={student.phoneNumber}
              initialAddress={student.address}
              onCompleted={refreshAll}
              className="mb-6"
            />
          )}
          <StudentProfile student={profileInfo} />
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickStat
            label="Roll Number"
            value={student.rollNo ?? ""}
            icon="🎓"
            color="from-emerald-50 to-emerald-100 border-emerald-200"
          />
          <QuickStat
            label="Academic Year"
            value={student.year ?? ""}
            icon="📅"
            color="from-green-50 to-green-100 border-green-200"
          />
          <QuickStat
            label="Current GPA"
            value={currentGPA.toFixed(2)}
            icon="⭐"
            color="from-emerald-50 to-emerald-100 border-emerald-200"
          />
          <QuickStat
            label="Credits Earned"
            value={`${totalCredits} cr`}
            icon="📚"
            color="from-green-50 to-green-100 border-green-200"
          />
        </div>

        <div className="mt-8 flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit shadow-sm">
          {(["overview", "grades", "attendance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <GPACard gpa={currentGPA} grades={formattedGrades} />
                <AttendanceSummary attendance={attendanceSummary} compact />
              </div>
              <div>
                <CalendarWidget events={events} />
              </div>
            </div>
          )}

          {activeTab === "grades" && (
            <div className="flex flex-col gap-6">
              <GPACard gpa={currentGPA} grades={formattedGrades} showDetails />
              <GradeTable grades={formattedGrades} />
            </div>
          )}

          {activeTab === "attendance" && <AttendanceSummary attendance={attendanceSummary} />}
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      className={`bg-linear-to-br ${color} border rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200 shadow-sm`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
