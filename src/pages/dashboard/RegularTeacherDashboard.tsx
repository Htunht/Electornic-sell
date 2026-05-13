import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import DashboardNav from "../../components/dashboard/DashboardNav";
import CreativeCalendar from "../../components/dashboard/CreativeCalendar";
import { teacherApi } from "../../lib/api";
import { 
  BookOpen, 
  ClipboardList,
  CalendarCheck,
  Calendar,
  LayoutDashboard,
  Search,
  ArrowRight,
  Trophy,
  Sparkles,
  ChevronRight,
  Clock,
  TrendingUp,
  Bell,
} from "lucide-react";
import { cn } from "../../lib/utils";

// ─── Regular Teacher Dashboard ────────────────────────────────────────────────
export default function RegularTeacherDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "students">("overview");

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-500/10" />
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/40 animate-spin" />
          <div className="mt-12 text-center">
            <p className="text-emerald-700 font-black tracking-widest text-sm uppercase animate-pulse">Initializing Portal</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !teacherData) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Immersive Background Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-400/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-400/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-yellow-200/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <DashboardNav session={session!} />

        {/* Dynamic Hero Section */}
        <div className="mt-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="relative z-10 p-8 md:p-16 lg:p-20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="max-w-2xl space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      Faculty Member Portal
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold">
                      <Sparkles size={12} className="text-yellow-400" />
                      Academic Year 2025-26
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                      {greeting}, <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400">
                        {session.user.name || "Teacher"}
                      </span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                      Empowering education through seamless management. Your personalized hub for classes, students, and results.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => setActiveTab("classes")}
                      className="group relative flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 transition-all font-black text-sm overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative z-10">Manage Classes</span>
                      <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all font-black text-sm">
                      Teaching Resources
                    </button>
                  </div>
                </div>

                {/* Quick Info Floating Card */}
                <div className="hidden xl:block w-80 p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</p>
                        <p className="text-sm font-bold text-white">{teacherData.major || "Computer Science"}</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Daily Progress</span>
                        <span className="text-emerald-400">85%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <CreativeStatCard 
            label="Assigned Subjects" 
            value={assignments.length} 
            icon={<BookOpen className="text-indigo-600" />} 
            color="indigo"
            trend="+2 this semester"
          />
          <CreativeStatCard 
            label="Department" 
            value={teacherData.major || "IT"} 
            icon={<LayoutDashboard className="text-emerald-600" />} 
            color="emerald"
            trend="Active Status"
          />
          <CreativeStatCard 
            label="Daily Attendance" 
            value="Record" 
            icon={<CalendarCheck className="text-amber-600" />} 
            color="amber"
            trend="Pending Review"
          />
          <CreativeStatCard 
            label="Performance" 
            value="Grading" 
            icon={<TrendingUp className="text-rose-600" />} 
            color="rose"
            trend="Open Portal"
          />
        </div>

        {/* Main Explorer Section */}
        <div className="mt-16 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          {/* Enhanced Navigation Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between px-10 pt-10 pb-6 gap-8">
            <div className="flex gap-1 p-1.5 bg-slate-100 rounded-[1.5rem]">
              {(["overview", "classes", "students"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-300",
                    activeTab === tab 
                      ? "bg-white text-emerald-600 shadow-xl shadow-slate-200" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="relative group w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                placeholder="Find assignments or students..."
                className="w-full h-14 pl-12 pr-6 bg-slate-50 rounded-[1.25rem] border-2 border-transparent text-sm font-bold focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-10">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="xl:col-span-2 space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Assignments</h3>
                      <p className="text-slate-400 text-sm font-medium mt-1">Your current teaching load for this academic term.</p>
                    </div>
                    <button onClick={() => setActiveTab("classes")} className="group flex items-center gap-2 text-emerald-600 text-sm font-black uppercase tracking-widest hover:translate-x-1 transition-all">
                      View all classes
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {assignments.length > 0 ? assignments.slice(0, 4).map(asgn => (
                      <PremiumClassCard key={asgn.id} asgn={asgn} />
                    )) : (
                      <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="size-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                          <BookOpen size={32} className="text-slate-300" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-400">No Assignments Yet</h4>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Subjects assigned by the head teacher will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-10">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Calendar size={20} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Timeline</h3>
                    </div>
                    <CreativeCalendar canEdit={true} />
                  </section>
                  
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                          <Bell size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Announcements</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[10px] font-black uppercase">Recent</span>
                    </div>
                    
                    <div className="space-y-4">
                      {announcements.length > 0 ? announcements.slice(0, 3).map(ann => (
                        <ModernAnnouncementCard 
                          key={ann.id}
                          title={ann.title}
                          date={new Date(ann.createdAt).toLocaleDateString()}
                          content={ann.content}
                          type={ann.type.toLowerCase() as any}
                        />
                      )) : (
                        <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No notifications</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* CLASSES TAB */}
            {activeTab === "classes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {assignments.map(asgn => (
                  <PremiumClassCard key={asgn.id} asgn={asgn} />
                ))}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    Academic Directory
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Student Management Portal</h3>
                  <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                    Select a target academic year and semester to access grading tools, attendance tracking, and student performance analytics.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-black">01</div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">Target Academic Year</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"].map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setStudentFilterYear(y);
                            setStudentFilterSem(null);
                          }}
                          className={cn(
                            "group relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300",
                            studentFilterYear === y
                              ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-indigo-200"
                              : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30"
                          )}
                        >
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", studentFilterYear === y ? "text-emerald-400" : "text-slate-400")}>Level</p>
                          <p className="text-lg font-black tracking-tight">{y.replace("_", " ")}</p>
                          {studentFilterYear === y && (
                            <div className="absolute top-4 right-4 size-6 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                              <Sparkles size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={cn("space-y-8 transition-all duration-500", studentFilterYear ? "opacity-100" : "opacity-30 pointer-events-none grayscale")}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-black">02</div>
                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">Select Term / Semester</h4>
                      </div>
                      <div className="flex gap-6">
                        {[1, 2].map((sem) => (
                          <button
                            key={sem}
                            onClick={() => setStudentFilterSem(sem)}
                            className={cn(
                              "flex-1 p-10 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-500",
                              studentFilterSem === sem
                                ? "bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-600 text-white shadow-2xl shadow-indigo-300"
                                : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"
                            )}
                          >
                            <span className={cn("text-5xl font-black", studentFilterSem === sem ? "text-white" : "text-slate-100")}>{sem}</span>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Semester</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={cn("transition-all duration-500 pt-8", studentFilterYear && studentFilterSem ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
                      <button
                        onClick={() => navigate(`/teacher/students/${studentFilterYear}?semester=${studentFilterSem}`)}
                        className="w-full group relative flex items-center justify-between p-8 rounded-[2.5rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-200 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                        <div className="relative z-10 text-left">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Authenticated Access</p>
                          <h5 className="text-2xl font-black">Launch Student Portal</h5>
                        </div>
                        <div className="relative z-10 size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-all">
                          <ArrowRight size={24} />
                        </div>
                      </button>
                    </div>
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

// ─── Sub-Components ──────────────────────────────────────────────────────────

function CreativeStatCard({ label, value, icon, color, trend }: { label: string, value: string | number, icon: React.ReactNode, color: string, trend?: string }) {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white",
    rose: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white",
  }[color as 'indigo' | 'emerald' | 'amber' | 'rose'];

  return (
    <div className="group bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-500 hover:-translate-y-2">
      <div className="flex justify-between items-start mb-8">
        <div className={cn("size-16 rounded-2xl flex items-center justify-center transition-all duration-500", themes)}>
          {icon}
        </div>
        <div className="p-2 bg-slate-50 text-slate-300 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">{value}</p>
        {trend && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Clock size={12} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function PremiumClassCard({ asgn }: { asgn: any }) {
  const navigate = useNavigate();
  const code = asgn.subject?.code || "N/A";
  const name = asgn.subject?.name || "N/A";
  const initial = code.split('-')[0];
  const subjectId = asgn.subject?.id;
  const year = asgn.year;
  
  return (
    <div className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-emerald-200/20 transition-all duration-700 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-[120px] -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="size-14 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-2xl">
            {initial}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
              {year.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Semester {asgn.subject?.semester || 1}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">{name}</h4>
          <p className="text-xs font-mono font-bold text-slate-400 mt-2 tracking-widest uppercase">{code}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => subjectId && navigate(`/teacher/students/${year}?subjectId=${subjectId}&mode=grading`)}
            className="group/btn relative h-14 w-full bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              <ClipboardList size={18} />
              Grade Entry
            </div>
          </button>
          <button 
            onClick={() => subjectId && navigate(`/teacher/students/${year}?subjectId=${subjectId}&mode=attendance`)}
            className="h-14 w-full bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
              <CalendarCheck size={18} />
              Attendance
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ModernAnnouncementCard({ title, date, content, type }: { title: string, date: string, content: string, type: 'urgent' | 'info' | 'academic' | 'general' }) {
  return (
    <div className={cn(
      "p-6 rounded-[1.75rem] border-2 transition-all hover:shadow-lg",
      type === 'urgent' ? 'border-rose-100 bg-rose-50/30' : 
      type === 'academic' ? 'border-indigo-100 bg-indigo-50/30' :
      'border-emerald-100 bg-emerald-50/30'
    )}>
      <div className="flex justify-between items-start mb-3">
        <h5 className="font-black text-slate-800 pr-4 leading-tight">{title}</h5>
        <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-sm">{date}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{content}</p>
    </div>
  );
}
