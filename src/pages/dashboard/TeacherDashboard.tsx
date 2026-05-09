import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import DashboardNav from "../../components/dashboard/DashboardNav";
import { teacherApi } from "../../lib/api";
import { 
  Users, 
  BookOpen, 
  ClipboardList,
  CalendarCheck,
  FileSpreadsheet, 
  PlusCircle,
  GraduationCap,
  Calendar,
  LayoutDashboard,
  Trophy,
  Search,
  ArrowRight,
  Edit2,
  Trash2,
  Library,
} from "lucide-react";

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "students" | "subjects">("overview");
  
  const [teacherData, setTeacherData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [newSubject, setNewSubject] = useState({ code: "", name: "", year: "YEAR_1", semester: 1, creditHours: 3 });
  const [creating, setCreating] = useState(false);

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
      }
    }
  }, [session, isPending, navigate]);

  const fetchData = async () => {
    try {
      const [profileRes, assignmentsRes, subjectsRes] = await Promise.all([
        teacherApi.getMe(),
        teacherApi.getAssignments(),
        teacherApi.getSubjects(),
      ]);
      setTeacherData(profileRes.data);
      setAssignments(assignmentsRes.data?.assignments ?? []);
      setAllSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
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
      if (editingSubject) {
        await teacherApi.updateSubject(editingSubject.id, newSubject);
      } else {
        await teacherApi.createSubject(newSubject);
      }
      setShowSubjectModal(false);
      setEditingSubject(null);
      setNewSubject({ code: "", name: "", year: "YEAR_1", semester: 1, creditHours: 3 });
      await fetchData(); // Refresh
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Failed to save subject.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      await teacherApi.deleteSubject(id);
      await fetchData();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject.");
    }
  };

  const openEditModal = (subject: any) => {
    setEditingSubject(subject);
    setNewSubject({ code: subject.code, name: subject.name, year: subject.year || "YEAR_1", semester: subject.semester || 1, creditHours: subject.creditHours || 3 });
    setShowSubjectModal(true);
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setNewSubject({ code: "", name: "", year: "YEAR_1", semester: 1, creditHours: 3 });
    setShowSubjectModal(true);
  };

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
              Manage your subjects, students, and grading all in one place. Your major is <span className="text-white">{teacherData.major || "Not set"}</span>.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={openCreateModal}
                className="group flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all font-bold text-sm"
              >
                <PlusCircle size={20} /> 
                Add New Subject
                <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl hover:bg-white/20 transition-all font-bold text-sm">
                <FileSpreadsheet size={20} /> Export Reports
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumStatCard 
            label="Assignments" 
            value={assignments.length} 
            icon={<BookOpen size={24} />} 
            gradient="from-blue-500 to-indigo-600"
            subtext="Active subjects"
          />
          <PremiumStatCard 
            label="Department" 
            value={teacherData.major || "IT"} 
            icon={<LayoutDashboard size={24} />} 
            gradient="from-emerald-500 to-teal-600"
            subtext="Primary Major"
          />
          <PremiumStatCard 
            label="Upcoming" 
            value="3" 
            icon={<Calendar size={24} />} 
            gradient="from-amber-500 to-orange-600"
            subtext="Exams this week"
          />
          <PremiumStatCard 
            label="Success Rate" 
            value="84%" 
            icon={<Trophy size={24} />} 
            gradient="from-rose-500 to-pink-600"
            subtext="Average grading"
          />
        </div>

        {/* Main Content Area */}
        <div className="mt-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
            <div className="flex gap-1 p-1.5 bg-slate-100/80 rounded-2xl mb-4 sm:mb-0">
              {(["overview", "classes", "students", "subjects"] as const).map((tab) => (
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
                placeholder="Quick search..."
                className="w-full h-10 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Recent Assignments</h3>
                    <button onClick={() => setActiveTab("classes")} className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.length > 0 ? assignments.slice(0, 4).map(asgn => (
                      <CreativeClassCard key={asgn.id} asgn={asgn} />
                    )) : (
                      <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No assignments yet. Add your first subject!</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Announcements</h3>
                  <div className="space-y-4">
                    <AnnouncementCard 
                      title="Final Semester Results" 
                      date="May 10, 2026" 
                      content="Please ensure all marks are entered by next Friday for processing."
                      type="urgent"
                    />
                    <AnnouncementCard 
                      title="New Faculty Meeting" 
                      date="May 12, 2026" 
                      content="Discussing the new curriculum for the next academic year."
                      type="info"
                    />
                  </div>
                  
                  <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-200">
                    <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Check out our teacher guide for detailed instructions on grading and subject management.</p>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                      View Documentation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "classes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assignments.map(asgn => (
                  <CreativeClassCard key={asgn.id} asgn={asgn} showDetails />
                ))}
                <button 
                  onClick={openCreateModal}
                  className="group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center mb-4 transition-colors">
                    <PlusCircle size={28} />
                  </div>
                  <span className="font-bold">Add Subject</span>
                </button>
              </div>
            )}

            {activeTab === "students" && (
              <div className="space-y-8">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Student & Attendance Management</h3>
                  <p className="text-slate-500 mt-2 text-lg">
                    Select an academic year to view student directories, record attendance, and manage examination results.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {["YEAR_1","YEAR_2","YEAR_3","YEAR_4","YEAR_5","YEAR_6"].map((y, idx) => (
                    <YearCard key={y} year={y} index={idx} onClick={() => navigate(`/teacher/students/${y}`)} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Subject Library</h3>
                    <p className="text-slate-500 mt-1 text-sm">
                      Manage subjects across all academic years for your major.
                    </p>
                  </div>
                  <button 
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors"
                  >
                    <PlusCircle size={18} />
                    New Subject
                  </button>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto pb-2">
                    <table className="w-full border-collapse text-left min-w-[750px]">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <th className="px-4 sm:px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Code</th>
                          <th className="px-4 sm:px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Subject Name</th>
                          <th className="px-4 sm:px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Year</th>
                          <th className="px-4 sm:px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Semester</th>
                          <th className="px-4 sm:px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Credits</th>
                          <th className="px-4 sm:px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allSubjects.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-4 sm:px-6 py-4">
                              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                                {sub.code}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 font-bold text-slate-800 text-sm">
                              {sub.name}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 whitespace-nowrap">
                                {sub.year.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black border-2 ${
                                sub.semester === 2 
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                  : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}>
                                S{sub.semester ?? 1}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-center font-bold text-slate-600 text-sm">
                              {sub.creditHours || 3}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openEditModal(sub)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                  title="Edit Subject"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSubject(sub.id)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
                                  title="Delete Subject"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {allSubjects.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                              <Library size={32} className="mx-auto mb-3 opacity-20" />
                              <p className="font-medium">No subjects found.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSubjectModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl">{editingSubject ? "Edit Subject" : "Create Subject"}</h2>
                <p className="text-emerald-100 text-xs mt-1">{editingSubject ? "Update subject details" : "Add a new subject to your curriculum"}</p>
              </div>
              <button onClick={() => setShowSubjectModal(false)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-8 space-y-6">
              <div className="space-y-4">
                <ModernInput 
                  label="Subject Code" 
                  placeholder="e.g. IT-3101" 
                  value={newSubject.code} 
                  onChange={v => setNewSubject({...newSubject, code: v})} 
                />
                <ModernInput 
                  label="Subject Name" 
                  placeholder="e.g. Data Structures" 
                  value={newSubject.name} 
                  onChange={v => setNewSubject({...newSubject, name: v})} 
                />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Academic Year</label>
                    <select
                      value={newSubject.year}
                      onChange={e => setNewSubject({...newSubject, year: e.target.value})}
                      className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {["YEAR_1","YEAR_2","YEAR_3","YEAR_4","YEAR_5","YEAR_6"].map(y => (
                        <option key={y} value={y}>{y.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Semester</label>
                    <div className="flex gap-2">
                      {[1, 2].map(sem => (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => setNewSubject({...newSubject, semester: sem})}
                          className={`flex-1 h-12 rounded-2xl border-2 text-sm font-bold transition-all ${
                            newSubject.semester === sem
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          Sem {sem}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ModernInput
                    type="number"
                    label="Credit Hours"
                    placeholder="3"
                    value={String(newSubject.creditHours)}
                    onChange={v => setNewSubject({...newSubject, creditHours: Number(v)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {creating ? "Saving…" : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Premium Helper Components ──────────────────────────────────────────────

function PremiumStatCard({ label, value, icon, gradient, subtext }: { label: string, value: string | number, icon: React.ReactNode, gradient: string, subtext: string }) {
  return (
    <div className="group bg-white p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
          <ArrowRight size={18} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <p className="text-xs font-medium text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function CreativeClassCard({ asgn, showDetails = false }: { asgn: any, showDetails?: boolean }) {
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
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
              {year.replace('_', ' ')}
            </span>
          </div>
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

function YearCard({ year, index, onClick }: { year: string, index: number, onClick: () => void }) {
  const colors = [
    "from-emerald-500 to-green-600",
    "from-blue-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
  ];
  
  return (
    <button
      onClick={onClick}
      className="group text-left relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[index % colors.length]} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white shadow-lg`}>
            <Users size={24} />
          </div>
          <span className="text-xs font-bold text-slate-300 tracking-tighter uppercase">Academic Year</span>
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 mb-2">{year.replace("_", " ")}</h3>
        <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">View all enrolled students and record academic performance results.</p>
        
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
          Access Portal <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function AnnouncementCard({ title, date, content, type }: { title: string, date: string, content: string, type: 'urgent' | 'info' }) {
  return (
    <div className={`p-5 rounded-2xl border-l-4 ${type === 'urgent' ? 'border-rose-500 bg-rose-50/50' : 'border-emerald-500 bg-emerald-50/50'} transition-all hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-bold text-slate-800">{title}</h5>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{date}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{content}</p>
    </div>
  );
}

function ModernInput({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
      />
    </div>
  );
}
