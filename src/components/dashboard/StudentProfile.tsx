import {  Phone, Mail, BookOpen, Award } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      {/* Decorative gradient header strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-t-3xl" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl shadow-emerald-100">
            {initial}
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{student.name}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              {student.year}
            </span>
          </div>
          <p className="text-slate-500 font-medium mb-3">{student.major}</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Award size={13} className="text-emerald-500" />
              {student.rollNo}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-emerald-500" />
              {student.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-500" />
              {student.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-emerald-500" />
              AY {student.academicYear} · Semester {student.semester}
            </span>
          </div>
        </div>

        {/* GPA Badge */}
        <div className="flex-shrink-0 text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#gpaGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(student.gpa / 4.0) * 264} 264`}
              />
              <defs>
                <linearGradient id="gpaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{student.gpa.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">GPA</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
