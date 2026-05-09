import { Phone, Mail, BookOpen, Award } from "lucide-react";

interface StudentProfileProps {
  student: {
    rollNo: string;
    name: string;
    major: string;
    year: string;
    email: string;
    phone: string;
    avatar?: string | null;
    gpa: number;
    totalCredits: number;
    semester: number;
    academicYear: string;
  };
}

export default function StudentProfile({ student }: StudentProfileProps) {
  const initial = student.name[0]?.toUpperCase() ?? "S";

  return (
    <div className="relative group overflow-hidden rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-10">
      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-full -mr-20 -mt-20 opacity-50 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
        {/* Profile Avatar / Large Initial */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-indigo-600 p-1 shadow-2xl shadow-emerald-200 group-hover:rotate-3 transition-transform duration-500">
            <div className="w-full h-full rounded-[2.25rem] bg-white flex items-center justify-center overflow-hidden">
              <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-indigo-600">
                {initial}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-xl border border-slate-50 flex items-center justify-center">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 size={14} />
            </div>
          </div>
        </div>

        {/* Essential Details */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{student.name}</h2>
              <div className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                {student.year?.replace('_', ' ')}
              </div>
            </div>
            <p className="text-slate-500 text-lg font-bold flex items-center gap-2">
              {student.major}
              <span className="size-1.5 rounded-full bg-slate-200" />
              <span className="text-emerald-600">Semester {student.semester}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <ProfileInfoItem icon={<Award size={16} />} label="Roll Number" value={student.rollNo} />
            <ProfileInfoItem icon={<Mail size={16} />} label="Student Email" value={student.email} />
            <ProfileInfoItem icon={<Phone size={16} />} label="Contact Number" value={student.phone} />
            <ProfileInfoItem icon={<BookOpen size={16} />} label="Academic Year" value={student.academicYear} />
          </div>
        </div>

        {/* Premium GPA Meter */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="url(#profileGpaGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(student.gpa / 4.0) * 276} 276`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="profileGpaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900">{student.gpa.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">GPA</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credits</p>
            <p className="text-sm font-bold text-slate-800">{student.totalCredits} Units Earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800 leading-none">{value}</p>
      </div>
    </div>
  );
}

function CheckCircle2({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

