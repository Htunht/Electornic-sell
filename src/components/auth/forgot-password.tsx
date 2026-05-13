import * as React from "react";
import { useNavigate } from "react-router";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailOtp } from "@/lib/auth-client";
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export function ForgetPassword({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStatus(null);

    try {
      const { error } = await emailOtp.sendVerificationOtp({
        email: data.email,
        type: "forget-password",
      });

      if (error) {
        setStatus({
          type: "error",
          message: error.message || "Something went wrong.",
        });
      } else {
        setStatus({
          type: "success",
          message: "A password recovery link has been dispatched to your institutional email.",
        });
        form.reset();
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSampleEmail = (role: 'headteacher' | 'teacher' | 'student') => {
    const samples = {
      headteacher: "headteacher@example.com",
      teacher: "teacher@example.com",
      student: "student@example.com",
    };
    form.setValue("email", samples[role]);
    // Small delay before auto submitting
    setTimeout(() => {
      form.handleSubmit(onSubmit)();
    }, 300);
  };

  return (
    <div className={cn("w-full flex min-h-[90vh] bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden rounded-[3.5rem] shadow-2xl border border-slate-100", className)} {...props}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row-reverse">
        
        {/* ─── Right Branding Panel (Hidden on Mobile) ─── */}
        <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-slate-800 to-indigo-950 opacity-90 z-0" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[100px] z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] z-0" />
            
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0zOUgxVjM5aDM4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] z-0 opacity-50" />
          </div>

          <div className="relative z-10 flex justify-end">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tight text-white">Lumina University</span>
              <div className="size-10 rounded-xl bg-indigo-500 flex items-center justify-center text-slate-900 shadow-lg shadow-indigo-500/20">
                <GraduationCap size={24} className="mr-1" />
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl self-end text-right">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              Account <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-blue-500">
                Recovery
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 ml-auto max-w-md">
              Securely regain access to your academic portal. Institutional policies require email verification for all password resets.
            </p>

            <div className="flex flex-wrap justify-end gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck size={20} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Verified Protocol</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-right">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 Lumina University. IT Support.</p>
          </div>
        </div>

        {/* ─── Left Recovery Panel ─── */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-white">
          
          {/* Mobile Branding (Visible only on mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-10 mt-8">
            <div className="size-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap size={24} className="ml-1" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Lumina Uni</span>
          </div>

          <div className="w-full max-w-md">
            
            <button 
              onClick={() => navigate("/login")}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-10"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Return to Login
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Forgot Password?</h2>
              <p className="text-slate-500 font-medium leading-relaxed">No worries. Enter your institutional email address and we'll send you a secure link to reset it.</p>
            </div>

            {/* Quick Demo Section */}
            <div className="mb-8 bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <Mail size={100} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-400" /> Test Emails
              </h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  type="button"
                  onClick={() => handleSampleEmail('headteacher')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  Head Teacher
                </button>
                <button 
                  type="button"
                  onClick={() => handleSampleEmail('teacher')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm hover:border-emerald-300 hover:text-emerald-600 transition-all"
                >
                  Teacher
                </button>
                <button 
                  type="button"
                  onClick={() => handleSampleEmail('student')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm hover:border-sky-300 hover:text-sky-600 transition-all"
                >
                  Student
                </button>
              </div>
            </div>

            {status && (
              <div className={cn(
                "mb-8 p-5 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-4",
                status.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              )}>
                {status.type === "success" ? (
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={24} className="text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-black text-sm mb-1">{status.type === "success" ? "Link Sent" : "Request Failed"}</h4>
                  <p className="text-xs font-medium leading-relaxed opacity-90">{status.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Institutional Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="e.g. ID12345@lumina.edu"
                        autoComplete="email"
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 pl-12 pr-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 shadow-sm"
                      />
                    </div>
                    {fieldState.invalid && (
                      <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />

              <button 
                type="submit" 
                disabled={isLoading || status?.type === 'success'}
                className="group w-full h-14 mt-2 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 relative z-10" />
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                By requesting a reset, you adhere to the <br/>
                <a href="#" className="text-slate-600 hover:text-indigo-600 underline decoration-slate-300 underline-offset-4 transition-colors">Acceptable Use Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
