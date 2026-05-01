import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import StudentProfile from "../../components/dashboard/StudentProfile";
import GPACard from "../../components/dashboard/GPACard";
import GradeTable from "../../components/dashboard/GradeTable";
import AttendanceSummary from "../../components/dashboard/AttendanceSummary";
import CalendarWidget from "../../components/dashboard/CalendarWidget";
import DashboardNav from "../../components/dashboard/DashboardNav";
import { studentApi, calendarApi } from "../../lib/api";

// ─── Student Dashboard ────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "grades" | "attendance"
  >("overview");

  const [studentData, setStudentData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          const [profileRes, resultsRes, eventsRes] = await Promise.all([
            studentApi.getMe(),
            studentApi.getResults(),
            calendarApi.getEvents(),
          ]);
          console.log("DEBUG: Results Data:", resultsRes.data);
          console.log("DEBUG: Events Data:", eventsRes.data);
          setStudentData(profileRes.data);
          setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
          setEvents(eventsRes.data?.events || []);
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

  // Calculate GPA from real results
  const totalGradePoints = results.reduce(
    (acc, r) => acc + r.gradePoint * (r.subject?.creditHours || 0),
    0,
  );
  const totalCredits = results.reduce(
    (acc, r) => acc + (r.subject?.creditHours || 0),
    0,
  );
  const currentGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  const profileInfo = {
    rollNo: studentData.rollNo,
    name: studentData.name,
    major: studentData.major,
    year: studentData.year,
    email: session.user.email,
    phone: studentData.phone || "N/A",
    gpa: currentGPA,
    totalCredits: totalCredits,
    semester: results[0]?.semester || 1,
    academicYear: results[0]?.academicYear || "2025-2026",
  };

  const formattedGrades = results.map((r) => ({
    ...r,
    code: r.subject?.code || "N/A",
    name: r.subject?.name || "N/A",
    credits: r.subject?.creditHours || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-slate-900 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-emerald-200/20 blur-[130px]" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-green-200/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-100/30 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <DashboardNav session={session} />

        <div className="mt-6">
          <StudentProfile student={profileInfo} />
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickStat
            label="Roll Number"
            value={studentData.rollNo}
            icon="🎓"
            color="from-emerald-50 to-emerald-100 border-emerald-200"
          />
          <QuickStat
            label="Academic Year"
            value={studentData.year}
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
                <AttendanceSummary attendance={[]} compact />
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

          {activeTab === "attendance" && <AttendanceSummary attendance={[]} />}
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
      className={`bg-gradient-to-br ${color} border rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200 shadow-sm`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
