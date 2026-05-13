import { useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import DashboardNav from "../../components/dashboard/DashboardNav";
import CreativeCalendar from "../../components/dashboard/CreativeCalendar";
import { headTeacherApi } from "../../lib/api";
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
  CheckCircle2,
} from "lucide-react";

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "students" | "subjects" | "teachers">("overview");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ─── Students tab filter state ──────────────────────────────────────────────
  const [studentFilterYear, setStudentFilterYear] = useState<string | null>(null);
  const [studentFilterSem, setStudentFilterSem] = useState<number | null>(null);
  
  const [teacherData, setTeacherData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectFilterYear, setSubjectFilterYear] = useState<string>("ALL");
  const [subjectFilterSemester, setSubjectFilterSemester] = useState<string>("ALL");

  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(sub => {
      const matchYear = subjectFilterYear === "ALL" || sub.year === subjectFilterYear;
      const matchSemester = subjectFilterSemester === "ALL" || sub.semester === Number(subjectFilterSemester);
      return matchYear && matchSemester;
    });
  }, [allSubjects, subjectFilterYear, subjectFilterSemester]);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [newSubject, setNewSubject] = useState({ code: "", name: "", year: "YEAR_1", semester: 1, creditHours: 3 });
  const [creating, setCreating] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "GENERAL", major: "ALL", year: "ALL" });
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [assigningToTeacher, setAssigningToTeacher] = useState({ subjectId: "", year: "YEAR_1" });
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

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
        // Stay here, but check if we need to redirect if it was /teacher
        if (window.location.pathname === "/teacher") {
          navigate("/head-teacher", { replace: true });
        }
      }
    }
  }, [session, isPending, navigate]);

  const fetchData = async () => {
    try {
      const [profileRes, assignmentsRes, subjectsRes, announcementsRes, teachersRes] = await Promise.all([
        headTeacherApi.getMe(),
        headTeacherApi.getAssignments(),
        headTeacherApi.getSubjects(),
        headTeacherApi.getAnnouncements(),
        headTeacherApi.getTeachers(),
      ]);
      setTeacherData(profileRes.data);
      setAssignments(assignmentsRes.data?.assignments ?? []);
      setAllSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      setAnnouncements(announcementsRes.data?.data ?? []);
      setAllTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
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
        await headTeacherApi.updateSubject(editingSubject.id, newSubject);
        showNotification("Subject updated successfully!", "success");
      } else {
        await headTeacherApi.createSubject(newSubject);
        showNotification("New subject created!", "success");
      }
      setShowSubjectModal(false);
      setEditingSubject(null);
      setNewSubject({ code: "", name: "", year: "YEAR_1", semester: 1, creditHours: 3 });
      await fetchData(); // Refresh
    } catch (error) {
      console.error("Error saving subject:", error);
      showNotification("Failed to save subject.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure? This will delete the subject globally.")) return;
    try {
      await headTeacherApi.deleteSubject(id);
      showNotification("Subject deleted from department library.", "success");
      await fetchData();
    } catch (error) {
      console.error("Error deleting subject:", error);
      showNotification("Failed to delete subject.", "error");
    }
  };
  const openEditModal = (subject: any) => {
    setEditingSubject(subject);
    setNewSubject({ code: subject.code, name: subject.name, year: subject.year || "YEAR_1", semester: subject.semester || 1, creditHours: subject.creditHours || 3 });
    setShowSubjectModal(true);
  };

  const handleAssignToMe = async (subject: any) => {
    try {
      await headTeacherApi.createAssignment({
        subjectId: subject.id,
        year: subject.year,
        canEdit: true,
      });
      showNotification(`Assigned "${subject.name}" to your list!`, "success");
      await fetchData();
    } catch (error) {
      console.error("Error assigning subject:", error);
      showNotification("Failed to assign subject.", "error");
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm("Remove this subject from your teaching list?")) return;
    try {
      await headTeacherApi.deleteAssignment(assignmentId);
      showNotification("Subject removed from your list.", "success");
      await fetchData();
    } catch (error) {
      console.error("Error unassigning subject:", error);
      showNotification("Failed to remove assignment.", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setNewSubject({ code: "", name: "", year: "YEAR_1", semester: 1, creditHours: 3 });
    setShowSubjectModal(true);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAnnouncement(true);
    try {
      await headTeacherApi.createAnnouncement({
        ...newAnnouncement,
        headTeacherId: teacherData.id,
        major: newAnnouncement.major === "ALL" ? undefined : newAnnouncement.major,
        year: newAnnouncement.year === "ALL" ? undefined : newAnnouncement.year,
      } as any);
      showNotification("Announcement posted!", "success");
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: "", content: "", type: "GENERAL", major: "ALL", year: "ALL" });
      await fetchData();
    } catch (error) {
      console.error("Error creating announcement:", error);
      showNotification("Failed to create announcement.", "error");
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  const handleAssignToTeacher = async () => {
    if (!selectedTeacher || !assigningToTeacher.subjectId) return;
    setIsAssigning(true);
    try {
      await headTeacherApi.assignToTeacher(selectedTeacher.id, {
        subjectId: assigningToTeacher.subjectId,
        year: assigningToTeacher.year,
        canEdit: true
      });
      showNotification(`Subject assigned to ${selectedTeacher.user?.name}`, "success");
      setAssignmentSuccess(true);
      setTimeout(() => setAssignmentSuccess(false), 3000);
      
      await fetchData();
      // Refresh selected teacher in modal
      const updatedTeacher = allTeachers.find(t => t.id === selectedTeacher.id);
      setSelectedTeacher(updatedTeacher);
    } catch (error) {
      console.error("Error assigning to teacher:", error);
      showNotification("Failed to assign subject.", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveFromTeacher = async (assignmentId: string) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      await headTeacherApi.deleteAssignment(assignmentId);
      showNotification("Assignment removed.", "success");
      await fetchData();
      // Refresh selected teacher in modal
      const updatedTeacher = allTeachers.find(t => t.id === selectedTeacher.id);
      setSelectedTeacher(updatedTeacher);
    } catch (error) {
      console.error("Error removing assignment:", error);
      showNotification("Failed to remove assignment.", "error");
    }
  };

  const openTeacherModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await headTeacherApi.deleteAnnouncement(id);
      showNotification("Announcement deleted.", "success");
      await fetchData();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      showNotification("Failed to delete announcement.", "error");
    }
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

        {/* Floating Notification */}
        {notification && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-8 duration-500">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] shadow-2xl backdrop-blur-xl border ${
              notification.type === "success" 
                ? "bg-emerald-500/90 border-emerald-400 text-white" 
                : "bg-rose-500/90 border-rose-400 text-white"
            }`}>
              {notification.type === "success" ? <Trophy size={18} /> : <BookOpen size={18} />}
              <span className="font-bold tracking-tight text-sm">{notification.message}</span>
            </div>
          </div>
        )}

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
              {(["overview", "classes", "students", "subjects", "teachers"] as const).map((tab) => (
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
                  <CreativeCalendar canEdit={true} />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Announcements</h3>
                    <button 
                      onClick={() => setShowAnnouncementModal(true)}
                      className="group p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      title="Post New Announcement"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {announcements.length > 0 ? announcements.map(ann => (
                      <AnnouncementCard 
                        key={ann.id}
                        title={ann.title}
                        date={new Date(ann.createdAt).toLocaleDateString()}
                        content={ann.content}
                        type={ann.type.toLowerCase() as any}
                        onDelete={() => handleDeleteAnnouncement(ann.id)}
                        canDelete={true}
                      />
                    )) : (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-medium">No announcements broadcasted yet.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-200">
                    <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Check out our teacher guide for detailed instructions on grading and subject management.</p>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors mb-3">
                      View Documentation
                    </button>
                    <button 
                      onClick={() => setShowAnnouncementModal(true)}
                      className="w-full py-3 bg-indigo-500/30 text-white border border-indigo-400/30 rounded-xl font-bold text-sm hover:bg-indigo-500/50 transition-colors"
                    >
                      Post Announcement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "classes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assignments.map(asgn => (
                  <CreativeClassCard key={asgn.id} asgn={asgn} />
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
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Student & Attendance Management</h3>
                  <p className="text-slate-500 mt-2 text-base leading-relaxed">
                    Select an academic year and semester to access student directories, record attendance, and manage examination results for your department.
                  </p>
                </div>

                {/* Step 1: Select Year */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] text-slate-600">1</span>
                    Select Academic Year
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"].map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setStudentFilterYear(y);
                          setStudentFilterSem(null); // Reset semester when year changes
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

                {/* Step 2: Select Semester (only visible if year selected) */}
                <div className={`space-y-4 transition-all duration-500 ${studentFilterYear ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] text-slate-600">2</span>
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
                        {studentFilterSem === sem && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Action (only visible if both selected) */}
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
                    onClick={() => navigate(`/head-teacher/students/${studentFilterYear}?semester=${studentFilterSem}`)}
                      className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-200"
                    >
                      Access Management
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
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
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select
                      value={subjectFilterYear}
                      onChange={e => setSubjectFilterYear(e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="ALL">All Years</option>
                      {["YEAR_1","YEAR_2","YEAR_3","YEAR_4","YEAR_5","YEAR_6"].map(y => (
                        <option key={y} value={y}>{y.replace("_", " ")}</option>
                      ))}
                    </select>
                    <select
                      value={subjectFilterSemester}
                      onChange={e => setSubjectFilterSemester(e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                    <button 
                      onClick={openCreateModal}
                      className="flex items-center justify-center gap-2 px-5 h-10 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors"
                    >
                      <PlusCircle size={18} />
                      New Subject
                    </button>
                  </div>
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
                        {filteredSubjects.map((sub: any) => (
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
                                 {assignments.some(a => a.subjectId === sub.id) ? (
                                   <button 
                                     onClick={() => handleUnassign(assignments.find(a => a.subjectId === sub.id)!.id)}
                                     className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                                     title="Un-assign from Me"
                                   >
                                     <Trash2 size={14} />
                                   </button>
                                 ) : (
                                   <button 
                                     onClick={() => handleAssignToMe(sub)}
                                     className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
                                     title="Assign to Me"
                                   >
                                     <PlusCircle size={14} />
                                   </button>
                                 )}
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
                                   title="Delete Subject Globally"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             </td>
                          </tr>
                        ))}
                        {filteredSubjects.length === 0 && (
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

            {activeTab === "teachers" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Faculty & Assignments</h3>
                  <p className="text-slate-500 mt-2 text-base leading-relaxed">
                    View all teachers in your department and their current subject assignments.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allTeachers.map((teacher: any) => (
                    <div key={teacher.id} className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                      {/* Decoration */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors duration-500" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center text-xl font-black shadow-lg">
                            {teacher.user?.name?.charAt(0) || "T"}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 truncate max-w-[150px]">{teacher.user?.name}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{teacher.major}</p>
                          </div>
                        </div>

                        <div className="space-y-4 flex-1">
                          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                            <span>Assigned Subjects</span>
                            <span className="text-emerald-600">{teacher.assignments?.length || 0}</span>
                          </div>
                          
                          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            {teacher.assignments?.length > 0 ? (
                              teacher.assignments.map((asgn: any) => (
                                <div key={asgn.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-all">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] font-black text-emerald-600">{asgn.subject?.code}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[8px] font-black uppercase tracking-tight">{asgn.year.replace("_", " ")}</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 truncate">{asgn.subject?.name}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No active assignments</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <button 
                            onClick={() => openTeacherModal(teacher)}
                            className="mt-6 w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
                          >
                            Manage Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Creative Subject Modal ── */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-lg"
            onClick={() => setShowSubjectModal(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row">
            
            {/* ── Left Decorative Panel (50%) ── */}
            <div className="relative hidden md:flex flex-1 flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white overflow-hidden">
              {/* Glow blobs */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute -top-1/4 -left-1/4 w-full h-full rounded-full bg-emerald-500/10 blur-[100px]" />
                <div className="absolute -bottom-1/4 -right-1/4 w-full h-full rounded-full bg-teal-500/10 blur-[100px]" />
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
                  <BookOpen size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">
                  {editingSubject ? "Edit\nSubject" : "New\nSubject"}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">
                  {editingSubject
                    ? "Update subject details for your curriculum."
                    : "Add a subject to your curriculum and assign it to the right year & semester."}
                </p>

                {/* Decorative dots grid */}
                <div className="grid grid-cols-5 gap-2 opacity-20 mt-12">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ))}
                </div>
              </div>

              {/* Subject preview pill - Floating at bottom */}
              {(newSubject.code || newSubject.name) && (
                <div className="relative z-10 mt-auto p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">Live Preview</p>
                  <div className="space-y-1 text-center">
                    <p className="font-mono text-xs font-bold text-emerald-400">{newSubject.code || "CODE"}</p>
                    <p className="text-base font-bold text-white truncate">{newSubject.name || "Subject Name"}</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                      {newSubject.year.replace("_", " ")}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-widest uppercase">
                      Sem {newSubject.semester}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Form Panel (50%) ── */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Mobile header (hidden on md+) */}
              <div className="md:hidden px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg">{editingSubject ? "Edit Subject" : "Create Subject"}</h2>
                  <p className="text-emerald-100 text-xs mt-0.5">{editingSubject ? "Update details" : "Add to your curriculum"}</p>
                </div>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >✕</button>
              </div>

              {/* Desktop close button */}
              <button
                onClick={() => setShowSubjectModal(false)}
                className="hidden md:flex absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 items-center justify-center text-slate-500 transition-colors z-10"
              >✕</button>

              <form onSubmit={handleCreateSubject} className="flex-1 flex flex-col p-8 md:p-10 gap-6 overflow-y-auto">
                
                {/* Code + Name - Stacked for better readability in 50/50 split */}
                <div className="space-y-5">
                  <ModernInput
                    label="Subject Code"
                    placeholder="e.g. IT-3101"
                    value={newSubject.code}
                    onChange={v => setNewSubject({ ...newSubject, code: v })}
                  />
                  <ModernInput
                    label="Subject Name"
                    placeholder="e.g. Data Structures"
                    value={newSubject.name}
                    onChange={v => setNewSubject({ ...newSubject, name: v })}
                  />
                </div>

                {/* Academic Year Grid */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Academic Year</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {["YEAR_1","YEAR_2","YEAR_3","YEAR_4","YEAR_5","YEAR_6"].map(y => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, year: y })}
                        className={`h-11 rounded-xl border-2 font-bold text-xs transition-all duration-300 ${
                          newSubject.year === y
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                            : "border-slate-50 bg-slate-50/50 text-slate-500 hover:border-slate-200 hover:bg-slate-100/50"
                        }`}
                      >
                        {y.replace("YEAR_", "Y")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semester + Credit Hours */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Semester Toggle */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Semester</label>
                    <div className="flex gap-3 h-12">
                      {[1, 2].map(sem => (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => setNewSubject({ ...newSubject, semester: sem })}
                          className={`flex-1 rounded-2xl border-2 text-sm font-black transition-all duration-300 ${
                            newSubject.semester === sem
                              ? sem === 1
                                ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-200"
                                : "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                              : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          S{sem}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credit Hours */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Credit Hours</label>
                    <div className="flex items-center gap-2 h-12 p-1 bg-slate-50/50 rounded-2xl border-2 border-slate-50">
                      <button
                        type="button"
                        onClick={() => setNewSubject(p => ({ ...p, creditHours: Math.max(1, p.creditHours - 1) }))}
                        className="w-10 h-full rounded-xl bg-white shadow-sm border border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
                      >−</button>
                      <div className="flex-1 flex items-center justify-center font-black text-slate-800 text-lg">
                        {newSubject.creditHours}
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewSubject(p => ({ ...p, creditHours: Math.min(6, p.creditHours + 1) }))}
                        className="w-10 h-full rounded-xl bg-white shadow-sm border border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => setShowSubjectModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all border border-slate-200/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newSubject.code || !newSubject.name}
                    className="flex-[1.5] h-14 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-40 disabled:grayscale transition-all flex items-center justify-center gap-3"
                  >
                    {creating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>{editingSubject ? "Update Subject" : "Create Subject"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Creative Announcement Modal ── */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-lg" onClick={() => setShowAnnouncementModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row min-h-[450px]">
            
            {/* Left Panel */}
            <div className="relative hidden md:flex flex-1 flex-col justify-between p-10 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute -top-1/4 -left-1/4 w-full h-full rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute -bottom-1/4 -right-1/4 w-full h-full rounded-full bg-violet-500/10 blur-[100px]" />
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-8 shadow-2xl">
                  <PlusCircle size={32} className="text-indigo-400" />
                </div>
                <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">Broad-cast</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">Send important updates to your students across majors and years.</p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col bg-white">
              <button onClick={() => setShowAnnouncementModal(false)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 items-center justify-center text-slate-500 transition-colors z-10 hidden md:flex">✕</button>
              
              <form onSubmit={handleCreateAnnouncement} className="flex-1 flex flex-col p-8 md:p-10 gap-5">
                <ModernInput 
                  label="Title" 
                  placeholder="e.g. Exam Schedule Update" 
                  value={newAnnouncement.title} 
                  onChange={v => setNewAnnouncement({...newAnnouncement, title: v})} 
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Content</label>
                  <textarea 
                    className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[100px] resize-none"
                    placeholder="Describe the update..."
                    value={newAnnouncement.content}
                    onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Type</label>
                    <select 
                      className="w-full h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
                      value={newAnnouncement.type}
                      onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                    >
                      <option value="GENERAL">General</option>
                      <option value="URGENT">Urgent</option>
                      <option value="ACADEMIC">Academic</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Major</label>
                    <select 
                      className="w-full h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
                      value={newAnnouncement.major}
                      onChange={e => setNewAnnouncement({...newAnnouncement, major: e.target.value})}
                    >
                      <option value="ALL">All Majors</option>
                      {["CIVIL", "ARCHI", "EP", "EC", "MC", "ME", "IT"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto pt-4">
                  <button type="button" onClick={() => setShowAnnouncementModal(false)} className="flex-1 h-12 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all border border-slate-200/50">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={creatingAnnouncement || !newAnnouncement.title || !newAnnouncement.content}
                    className="flex-[1.5] h-12 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {creatingAnnouncement ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Post Update</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Management Modal */}
      {showTeacherModal && selectedTeacher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTeacherModal(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Users size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-500/30">
                  {selectedTeacher.user?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedTeacher.user?.name}</h3>
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-1">{selectedTeacher.major} FACULTY</p>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar relative">
              {/* Success Overlay */}
              {assignmentSuccess && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
                    <CheckCircle2 size={48} className="text-emerald-600 relative z-10" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Assignment Complete!</h4>
                  <p className="text-slate-500 font-medium text-center max-w-[250px]">
                    {selectedTeacher.user?.name} is now authorized to teach this subject.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Assignments */}
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Assignments</h4>
                  <div className="space-y-3">
                    {selectedTeacher.assignments?.map((assignment: any) => (
                      <div key={assignment.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-emerald-600 uppercase mb-0.5">{assignment.subject?.code}</span>
                          <span className="text-sm font-bold text-slate-700">{assignment.subject?.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1">{assignment.year.replace("_", " ")}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromTeacher(assignment.id)}
                          className="w-8 h-8 rounded-xl bg-white text-rose-500 border border-slate-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(!selectedTeacher.assignments || selectedTeacher.assignments.length === 0) && (
                      <div className="py-8 text-center rounded-3xl border-2 border-dashed border-slate-100 text-slate-300">
                        <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold italic">No assignments found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add New Assignment */}
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Assign New Subject</h4>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Select Subject</label>
                      <select 
                        value={assigningToTeacher.subjectId}
                        onChange={(e) => setAssigningToTeacher({...assigningToTeacher, subjectId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        <option value="">Choose a subject...</option>
                        {allSubjects.map(s => (
                          <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Academic Year</label>
                      <select 
                        value={assigningToTeacher.year}
                        onChange={(e) => setAssigningToTeacher({...assigningToTeacher, year: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        {["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"].map(y => (
                          <option key={y} value={y}>{y.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={handleAssignToTeacher}
                      disabled={isAssigning || !assigningToTeacher.subjectId}
                      className="w-full py-4 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                    >
                      {isAssigning ? "Processing..." : (
                        <>
                          <PlusCircle size={16} /> Assign Subject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowTeacherModal(false)}
                className="px-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Close
              </button>
            </div>
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
            onClick={() => subjectId && navigate(`/head-teacher/students/${year}?subjectId=${subjectId}&mode=grading`)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <ClipboardList size={16} />
            Enter Grades
          </button>
          <button 
            onClick={() => subjectId && navigate(`/head-teacher/students/${year}?subjectId=${subjectId}&mode=attendance`)}
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


function AnnouncementCard({ title, date, content, type, onDelete, canDelete }: { title: string, date: string, content: string, type: 'urgent' | 'info' | 'academic' | 'general', onDelete?: () => void, canDelete?: boolean }) {
  return (
    <div className={`group relative p-5 rounded-2xl border-l-4 ${
      type === 'urgent' ? 'border-rose-500 bg-rose-50/50' : 
      type === 'academic' ? 'border-indigo-500 bg-indigo-50/50' :
      'border-emerald-500 bg-emerald-50/50'
    } transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-bold text-slate-800 pr-6">{title}</h5>
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">{date}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{content}</p>
      
      {canDelete && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

function ModernInput({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-13 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all duration-300"
      />
    </div>
  );
}
