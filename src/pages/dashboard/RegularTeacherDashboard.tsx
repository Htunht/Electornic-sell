import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import DashboardNav from "../../components/dashboard/DashboardNav";
import CreativeCalendar from "../../components/dashboard/CreativeCalendar";
import { teacherApi } from "../../lib/api";
import { 
  Users, 
  BookOpen, 
  ClipboardList,
  CalendarCheck,
  GraduationCap,
  Calendar,
  LayoutDashboard,
  Search,
  ArrowRight,
  Trophy,
} from "lucide-react";


// ─── Regular Teacher Dashboard ────────────────────────────────────────────────
export default function RegularTeacherDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "students">("overview");

  // ─── Students tab filter state ──────────────────────────────────────────────
  const [studentFilterYear, setStudentFilterYear] = useState<string | null>(null);
  const [studentFilterSem, setStudentFilterSem] = useState<number | null>(null);
  
  const [teacherData, setTeacherData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        navigate("/login");
      } else if (session.user.role === "STUDENT") {
        navigate("/student");
      } else if (session.user.role === "HEAD_TEACHER") {
        navigate("/head-teacher");
      }
    }
  }, [session, isPending, navigate]);

  const fetchData = async () => {
    try {
      const [profileRes, assignmentsRes, announcementsRes] = await Promise.all([
        teacherApi.getMe(),
        teacherApi.getAssignments(),
        teacherApi.getAnnouncements(),
      ]);
      setTeacherData(profileRes.data);
      setAssignments(assignmentsRes.data?.assignments ?? []);
      setAnnouncements(announcementsRes.data?.data ?? []);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50/50">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/30 animate-spin" />
          <div className="mt-8 text-center">
            <p className="text-emerald-700 font-bold tracking-widest text-sm uppercase animate-pulse">Initializing</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !teacherData) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-yellow-200/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <DashboardNav session={session} />

        {/* Hero Header */}
        <div className="mt-8 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-8 md:p-12 shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 hidden lg:block">
            <GraduationCap size={240} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                Teacher Dashboard
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">{session.user.name?.split(' ')[0] || "Teacher"}</span>!
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium">
              Welcome to your portal. Manage your assigned subjects and record student performance.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab("classes")}
                className="group flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all font-bold text-sm"
              >
                View My Classes
                <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumStatCard 
            label="Assigned Classes" 
            value={assignments.length} 
            icon={<BookOpen size={24} />} 
            gradient="from-blue-500 to-indigo-600"
            subtext="Subjects you teach"
          />
          <PremiumStatCard 
            label="Department" 
            value={teacherData.major || "IT"} 
            icon={<LayoutDashboard size={24} />} 
            gradient="from-emerald-500 to-teal-600"
            subtext="Primary Major"
          />
          <PremiumStatCard 
            label="Attendance" 
            value="Today" 
            icon={<Calendar size={24} />} 
            gradient="from-amber-500 to-orange-600"
            subtext="Record presence"
          />
          <PremiumStatCard 
            label="Achievements" 
            value="Grading" 
            icon={<Trophy size={24} />} 
            gradient="from-rose-500 to-pink-600"
            subtext="Sync results"
          />
        </div>

        {/* Main Content Area */}
        <div className="mt-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
            <div className="flex gap-1 p-1.5 bg-slate-100/80 rounded-2xl mb-4 sm:mb-0">
              {(["overview", "classes", "students"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 text-sm font-bold capitalize rounded-xl transition-all ${
                    activeTab === tab 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                placeholder="Search assignments..."
                className="w-full h-10 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Current Assignments</h3>
                    <button onClick={() => setActiveTab("classes")} className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.length > 0 ? assignments.slice(0, 4).map(asgn => (
                      <CreativeClassCard key={asgn.id} asgn={asgn} />
                    )) : (
                      <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No subjects assigned yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <CreativeCalendar canEdit={false} />
                  
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Announcements</h3>
                  <div className="space-y-4">
                    {announcements.length > 0 ? announcements.map(ann => (
                      <AnnouncementCard 
                        key={ann.id}
                        title={ann.title}
                        date={new Date(ann.createdAt).toLocaleDateString()}
                        content={ann.content}
                        type={ann.type.toLowerCase() as any}
                      />
                    )) : (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-medium">No recent announcements.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "classes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assignments.map(asgn => (
                  <CreativeClassCard key={asgn.id} asgn={asgn} />
                ))}
              </div>
            )}

            {activeTab === "students" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Student Management</h3>
                  <p className="text-slate-500 mt-2 text-base leading-relaxed">
                    Select a year and semester to manage students in your assigned subjects.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Select Academic Year
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"].map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setStudentFilterYear(y);
                          setStudentFilterSem(null);
                        }}
                        className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 ${
                          studentFilterYear === y
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                            : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        {y.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`space-y-4 transition-all duration-500 ${studentFilterYear ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Select Semester
                  </div>
                  <div className="flex gap-4">
                    {[1, 2].map((sem) => (
                      <button
                        key={sem}
                        onClick={() => setStudentFilterSem(sem)}
                        className={`group relative flex flex-col items-center justify-center w-40 h-28 rounded-[2rem] border-2 transition-all duration-300 ${
                          studentFilterSem === sem
                            ? "bg-slate-900 border-slate-900 text-white shadow-xl"
                            : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-600"
                        }`}
                      >
                        <span className={`text-3xl font-black mb-1 ${studentFilterSem === sem ? "text-emerald-400" : "text-slate-200 group-hover:text-emerald-100"}`}>S{sem}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Semester {sem}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`transition-all duration-500 ${studentFilterYear && studentFilterSem ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Users size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">{studentFilterYear?.replace("_", " ")}</h4>
                        <p className="text-emerald-700 font-medium">Semester {studentFilterSem} Portal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/teacher/students/${studentFilterYear}?semester=${studentFilterSem}`)}
                      className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-200"
                    >
                      Access Management
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumStatCard({ label, value, icon, gradient, subtext }: { label: string, value: string | number, icon: React.ReactNode, gradient: string, subtext: string }) {
  return (
    <div className="group bg-white p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function CreativeClassCard({ asgn }: { asgn: any }) {
  const navigate = useNavigate();
  const code = asgn.subject?.code || "N/A";
  const name = asgn.subject?.name || "N/A";
  const initial = code.split('-')[0];
  const subjectId = asgn.subject?.id;
  const year = asgn.year;
  
  return (
    <div className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            {initial}
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
            {year.replace('_', ' ')}
          </span>
        </div>
        
        <h4 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{name}</h4>
        <p className="text-sm font-mono text-slate-400 mb-6">{code}</p>
        
        <div className="flex flex-col gap-3 mt-6">
          <button 
            onClick={() => subjectId && navigate(`/teacher/students/${year}?subjectId=${subjectId}&mode=grading`)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <ClipboardList size={16} />
            Enter Grades
          </button>
          <button 
            onClick={() => subjectId && navigate(`/teacher/students/${year}?subjectId=${subjectId}&mode=attendance`)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <CalendarCheck size={16} />
            Take Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ title, date, content, type }: { title: string, date: string, content: string, type: 'urgent' | 'info' | 'academic' | 'general' }) {
  return (
    <div className={`p-5 rounded-2xl border-l-4 ${
      type === 'urgent' ? 'border-rose-500 bg-rose-50/50' : 
      type === 'academic' ? 'border-indigo-500 bg-indigo-50/50' :
      'border-emerald-500 bg-emerald-50/50'
    } transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-bold text-slate-800 pr-6">{title}</h5>
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">{date}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{content}</p>
    </div>
  );
}
