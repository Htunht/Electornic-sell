import { useState } from "react";
import { Link, useNavigate } from "react-router";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { 
  Eye, 
  EyeOff, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  ShieldCheck,
  User,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: FormValues) {
    setError(null);
    setIsLoading(true);
    try {
      await signIn.email({ email: data.email, password: data.password });
      // simulated wait for animation to show
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSampleLogin = (role: 'headteacher' | 'teacher' | 'student') => {
    const samples = {
      headteacher: { email: "headteacher@example.com", password: "password123" },
      teacher: { email: "teacher@example.com", password: "password123" },
      student: { email: "student@example.com", password: "password123" },
    };
    
    form.setValue("email", samples[role].email);
    form.setValue("password", samples[role].password);
    
    // Auto submit after a tiny delay for visual feedback
    setTimeout(() => {
      form.handleSubmit(onSubmit)();
    }, 300);
  };

  return (
    <div className={cn("w-full flex min-h-[90vh] bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 overflow-hidden rounded-[3.5rem] shadow-2xl border border-slate-100", className)} {...props}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row">
        
        {/* ─── Left Branding Panel (Hidden on Mobile) ─── */}
        <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 opacity-90 z-0" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px] z-0" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px] z-0" />
            
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0zOUgxVjM5aDM4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] z-0 opacity-50" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
                <GraduationCap size={24} className="ml-1" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Lumina University</span>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              Welcome to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                Future of Learning
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
              Access the unified academic portal to manage your classes, track attendance, update grading, and stay connected with the campus community.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck size={20} className="text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Secure Access</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Sparkles size={20} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Modern Portal</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 Lumina University. All rights reserved.</p>
          </div>
        </div>

        {/* ─── Right Login Panel ─── */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-white">
          
          {/* Mobile Branding (Visible only on mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-10 mt-8">
            <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
              <GraduationCap size={24} className="ml-1" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Lumina Uni</span>
          </div>

          <div className="w-full max-w-md">
            
            {/* Quick Demo Section */}
            <div className="mb-10 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BookOpen size={100} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Quick Demo Access
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => handleSampleLogin('headteacher')}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all group"
                >
                  <ShieldCheck size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Head Teacher</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleSampleLogin('teacher')}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all group"
                >
                  <BookOpen size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Teacher</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleSampleLogin('student')}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-sky-300 hover:-translate-y-0.5 transition-all group"
                >
                  <User size={18} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Student</span>
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Sign In</h2>
              <p className="text-slate-500 font-medium">Enter your university credentials to continue.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle size={20} className="text-rose-500 mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-rose-700 leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">University Email</label>
                    <input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="e.g. ID12345@lumina.edu"
                      autoComplete="email"
                      className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                    />
                    {fieldState.invalid && (
                      <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Password</label>
                      <Link to="/forgot-password" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />

              <button 
                type="submit" 
                disabled={isLoading}
                className="group w-full h-14 mt-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                New to Lumina?{" "}
                <Link to="/signup" className="font-bold text-slate-900 hover:text-emerald-600 transition-colors underline decoration-2 underline-offset-4 decoration-emerald-200">
                  Request an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
