import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import DashboardNav from "../../components/dashboard/DashboardNav";
import { teacherApi } from "../../lib/api";
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  FileSpreadsheet, 
  PlusCircle,
  ChevronRight,
} from "lucide-react";

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "students">("overview");
  
  const [teacherData, setTeacherData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ code: "", name: "", year: "YEAR_1", creditHours: 3 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        navigate("/login");
      } else if (session.user.role === "STUDENT") {
        navigate("/student");
      }
    }
  }, [session, isPending, navigate]);

  const fetchData = async () => {
    try {
      const [profileRes, assignmentsRes] = await Promise.all([
        teacherApi.getMe(),
        teacherApi.getAssignments(),
      ]);
      setTeacherData(profileRes.data);
      setAssignments(assignmentsRes.data?.assignments ?? []);
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

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await teacherApi.createSubject(newSubject);
      setShowSubjectModal(false);
      setNewSubject({ code: "", name: "", year: "YEAR_1", creditHours: 3 });
      await fetchData(); // Refresh
    } catch (error) {
      console.error("Error creating subject:", error);
      alert("Failed to create subject.");
    } finally {
      setCreating(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/30 border-b-emerald-500/10 border-l-emerald-500/50 animate-spin" />
          <p className="text-emerald-600 text-sm font-medium tracking-wider animate-pulse">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!session || !teacherData) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-white text-slate-900 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-emerald-200/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-green-100/30 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <DashboardNav session={session} />

        {/* Header Section */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome back, {session.user.name || "Teacher"}!</h1>
            <p className="text-slate-500 mt-1">Major: {String(teacherData.major ?? "—")}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSubjectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-medium text-sm"
            >
              <PlusCircle size={18} /> Add Subject
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm">
              <FileSpreadsheet size={18} /> Export Reports
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Assignments" value={String(assignments.length)} icon={<BookOpen className="text-blue-600" />} color="bg-blue-50" />
          <StatCard label="Major" value={String(teacherData.major ?? "IT")} icon={<Users className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Email" value={String(teacherData.user?.email ?? "—")} icon={<ClipboardCheck className="text-amber-600" />} color="bg-amber-50" />
          <StatCard label="Role" value={String(session.user.role ?? "")} icon={<Users className="text-teal-600" />} color="bg-teal-50" />
        </div>

        {/* Main Content Tabs */}
        <div className="mt-10">
          <div className="flex border-b border-slate-200">
            {["overview", "classes", "students"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${
                  activeTab === tab 
                    ? "border-emerald-600 text-emerald-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <SectionTitle title="My Active Assignments" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignments.map(asgn => (
                      <ClassCard key={asgn.id} classInfo={{
                        code: asgn.subject?.code || "N/A",
                        name: asgn.subject?.name || "N/A",
                        students: 40,
                        year: asgn.year,
                        major: asgn.major
                      }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <SectionTitle title="Quick Actions" />
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <p className="text-sm text-slate-500 italic">Select a class to manage results or attendance.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "classes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map(asgn => (
                  <ClassCard key={asgn.id} classInfo={{
                    code: asgn.subject?.code || "N/A",
                    name: asgn.subject?.name || "N/A",
                    students: 40,
                    year: asgn.year,
                    major: asgn.major
                  }} showAction />
                ))}
              </div>
            )}

            {activeTab === "students" && (
              <div className="space-y-6">
                <SectionTitle title="Students by Year" />
                <p className="text-sm text-slate-500 -mt-2">
                  Choose a year to view and paginate students.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["YEAR_1","YEAR_2","YEAR_3","YEAR_4","YEAR_5","YEAR_6"].map((y) => (
                    <button
                      key={y}
                      onClick={() => navigate(`/teacher/students/${y}`)}
                      className="text-left rounded-3xl border border-slate-200/70 bg-linear-to-br from-white to-emerald-50/40 p-5 hover:shadow-md hover:shadow-emerald-100 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Students
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          {y.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-3 text-xl font-bold text-slate-800">
                        {y.replace("_", " ")}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        View & paginate {y.replace("_", " ").toLowerCase()} students →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-linear-to-r from-emerald-600 to-green-600 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Create New Subject</h2>
              <button onClick={() => setShowSubjectModal(false)} className="text-white/80 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject Code</label>
                <input 
                  required
                  placeholder="e.g. IT-3101"
                  value={newSubject.code}
                  onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject Name</label>
                <input 
                  required
                  placeholder="e.g. Data Structures"
                  value={newSubject.name}
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Academic Year</label>
                  <select 
                    value={newSubject.year}
                    onChange={e => setNewSubject({...newSubject, year: e.target.value})}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
                  >
                    {["YEAR_1","YEAR_2","YEAR_3","YEAR_4","YEAR_5","YEAR_6"].map(y => (
                      <option key={y} value={y}>{y.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Credit Hours</label>
                  <input 
                    type="number"
                    min="1"
                    max="6"
                    value={newSubject.creditHours}
                    onChange={e => setNewSubject({...newSubject, creditHours: Number(e.target.value)})}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {creating ? "Creating…" : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">{title}</h3>;
}

function ClassCard({ classInfo, showAction = false }: { classInfo: any, showAction?: boolean }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">
          {classInfo.code.split('-')[0]}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{classInfo.year}</p>
          <p className="text-xs font-semibold text-slate-600">{classInfo.major} Major</p>
        </div>
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{classInfo.name}</h4>
      <p className="text-xs text-slate-400 mb-6 font-mono">{classInfo.code}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{classInfo.students} Students</span>
        </div>
        {showAction ? (
           <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">
             <ChevronRight size={18} />
           </button>
        ) : (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Active</span>
        )}
      </div>
    </div>
  );
}
