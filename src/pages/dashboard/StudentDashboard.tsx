import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import StudentProfile from "../../components/dashboard/StudentProfile";
import GPACard from "../../components/dashboard/GPACard";
import GradeTable from "../../components/dashboard/GradeTable";
import AttendanceSummary from "../../components/dashboard/AttendanceSummary";
import DashboardNav from "../../components/dashboard/DashboardNav";
import CompleteStudentProfileCard from "../../components/dashboard/CompleteStudentProfileCard";
import CreativeCalendar from "../../components/dashboard/CreativeCalendar";
import { studentApi } from "../../lib/api";
import {  
  Calendar, 
  Award, 
  BookOpen, 
  LayoutDashboard, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "../../lib/utils";

// ─── Student Dashboard ────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "grades" | "attendance"
  >("overview");

  const [studentData, setStudentData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [attendanceRaw, setAttendanceRaw] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const refreshAll = async () => {
    const [profileRes, resultsRes, attendanceRes] = await Promise.all([
      studentApi.getMe(),
      studentApi.getResults(),
      studentApi.getAttendance(),
    ]);
    setStudentData(profileRes.data);
    setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    setAttendanceRaw(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);

    // Fetch announcements after profile is available to get major/year
    if (profileRes.data) {
      const annRes = await studentApi.getAnnouncements({
        major: profileRes.data.major,
        year: profileRes.data.year,
      });
      setAnnouncements(annRes.data?.data || []);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        navigate("/login");
      } else if (session.user.role !== "STUDENT") {
        navigate("/head-teacher");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-500/10" />
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/40 animate-spin" />
          <div className="mt-12 text-center">
            <p className="text-emerald-700 font-black tracking-widest text-sm uppercase animate-pulse">Synchronizing</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !studentData) return null;

  const student = studentData;

  // Calculate GPA from real results
  const typedResults = results;
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

  const formattedGrades = typedResults.map((r, idx) => ({
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

  const attendanceSummary = Object.values(
    attendanceRaw.reduce<Record<string, any>>((acc, row) => {
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

  const totalPossible = attendanceRaw.length;
  const totalPresent = attendanceRaw.filter(a => a.status === "PRESENT").length;
  const overallAttendancePct = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-400/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-[140px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-blue-400/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <DashboardNav session={session} />

        {/* Dynamic Hero Section */}
        <div className="mt-8 relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white p-8 md:p-14 shadow-2xl shadow-indigo-900/20">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] hidden lg:block">
            <LayoutDashboard size={400} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    Academic Journey
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-200 text-[10px] font-bold">
                    <Sparkles size={12} className="text-yellow-400" />
                    Premium Portal
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-[1.1]">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-blue-300 to-indigo-300">{session.user.name?.split(' ')[0] || "Student"}</span>!
                </h1>
                
                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                  Welcome back to your academic hub. You're currently enrolled in <span className="text-white font-bold">{student.major || "IT"}</span>, <span className="text-white font-bold">{student.year?.replace('_', ' ')}</span>.
                </p>
                
                <div className="mt-10 flex flex-wrap gap-4">
                  <button className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 transition-all font-black text-sm">
                    View Schedule
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl hover:bg-white/20 transition-all font-black text-sm">
                    Student Resources
                  </button>
                </div>
              </div>

              {/* Quick Profile Overview Overlay */}
              <div className="hidden lg:block w-72 p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                      {session.user.name?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">{session.user.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">{student.rollNo}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Status</span>
                      <span className="text-emerald-400">Enrolled</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Warning */}
        {needsProfile && (
          <div className="mt-8">
            <CompleteStudentProfileCard
              initialRollNo={student.rollNo}
              initialYear={student.year}
              initialPhoneNumber={student.phoneNumber}
              initialAddress={student.address}
              onCompleted={refreshAll}
              className="rounded-[2.5rem] border-rose-100 bg-rose-50/50"
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CreativeStat 
            label="Academic Year" 
            value={student.year?.replace('_', ' ') || "N/A"} 
            icon={<Calendar className="text-emerald-600" />} 
            bg="bg-emerald-50"
            trend="Current"
          />
          <CreativeStat 
            label="Cumulative GPA" 
            value={currentGPA.toFixed(2)} 
            icon={<Award className="text-indigo-600" />} 
            bg="bg-indigo-50"
            trend="+0.12 vs last sem"
            trendColor="text-emerald-600"
          />
          <CreativeStat 
            label="Credits Earned" 
            value={totalCredits} 
            icon={<BookOpen className="text-blue-600" />} 
            bg="bg-blue-50"
            trend="Total units"
          />
          <CreativeStat 
            label="Attendance" 
            value={`${overallAttendancePct}%`} 
            icon={<TrendingUp className={cn(overallAttendancePct < 75 ? "text-rose-600" : "text-amber-600")} />} 
            bg={overallAttendancePct < 75 ? "bg-rose-50" : "bg-amber-50"}
            trend={overallAttendancePct < 75 ? "Below requirement" : "Exceeds requirement"}
            trendColor={overallAttendancePct < 75 ? "text-rose-600" : "text-emerald-600"}
          />
        </div>

        {/* Main Content Explorer */}
        <div className="mt-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Content Column */}
            <div className="flex-1 space-y-10">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex gap-1 p-1 bg-slate-200/50 rounded-2xl">
                  {(["overview", "grades", "attendance"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-white text-emerald-600 shadow-md"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Academic Profile</h3>
                        <button className="text-emerald-600 font-bold text-sm hover:underline">Edit Profile</button>
                      </div>
                      <StudentProfile student={profileInfo} />
                    </section>
                    
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Performance Summary</h4>
                          <Award size={18} className="text-emerald-500" />
                        </div>
                        <GPACard gpa={currentGPA} grades={formattedGrades} />
                      </div>
                      
                      <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Attendance</h4>
                          <CheckCircle2 size={18} className="text-blue-500" />
                        </div>
                        <AttendanceSummary attendance={attendanceSummary} compact />
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "grades" && (
                  <div className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h3 className="text-2xl font-black mb-1">Academic Records</h3>
                          <p className="text-indigo-100 text-sm font-medium">A detailed breakdown of your subject performance and grades.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                          <div className="text-center px-4 border-r border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">GPA</p>
                            <p className="text-xl font-black">{currentGPA.toFixed(2)}</p>
                          </div>
                          <div className="text-center px-4">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Credits</p>
                            <p className="text-xl font-black">{totalCredits}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <GradeTable grades={formattedGrades} />
                  </div>
                )}

                {activeTab === "attendance" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Analytics</h3>
                        <p className="text-slate-500 text-sm mt-1">Monitor your presence across all enrolled subjects.</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                        <Clock size={16} /> Updated daily
                      </div>
                    </div>
                    <AttendanceSummary attendance={attendanceSummary} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-80 space-y-10">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Announcements</h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {announcements.length > 0 ? announcements.slice(0, 3).map(ann => (
                    <AnnouncementCard 
                      key={ann.id}
                      title={ann.title}
                      date={new Date(ann.createdAt).toLocaleDateString()}
                      content={ann.content}
                      type={ann.type.toLowerCase() as any}
                    />
                  )) : (
                    <div className="p-8 text-center bg-slate-100/50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No updates</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Calendar</h3>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <CreativeCalendar canEdit={false} />
              </section>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl overflow-hidden relative group cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-lg mb-2">Grade Predictor</h4>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">Simulate your future GPA by projecting your current performance trends.</p>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black text-xs hover:bg-slate-50 transition-colors shadow-xl">
                    Launch Simulator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreativeStat({ 
  label, 
  value, 
  icon, 
  bg, 
  trend, 
  trendColor = "text-slate-400" 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  bg: string;
  trend?: string;
  trendColor?: string;
}) {
  return (
    <div className="group bg-white p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-500 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
          {icon}
        </div>
        <button className="p-2 bg-slate-50 text-slate-300 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <p className={`text-[10px] font-bold mt-2 ${trendColor}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

function AnnouncementCard({ title, date, content, type }: { title: string, date: string, content: string, type: 'urgent' | 'info' | 'academic' | 'general' }) {
  return (
    <div className={`p-4 rounded-2xl border-l-4 ${
      type === 'urgent' ? 'border-rose-500 bg-rose-50/50' : 
      type === 'academic' ? 'border-indigo-500 bg-indigo-50/50' :
      'border-emerald-500 bg-emerald-50/50'
    } transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-1.5">
        <h5 className="font-bold text-slate-800 text-xs">{title}</h5>
        <span className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap ml-2">{date}</span>
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{content}</p>
    </div>
  );
}
