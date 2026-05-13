import { useState } from "react";
import { Link, useNavigate } from "react-router";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signUp, emailOtp } from "@/lib/auth-client";
import { 
  Eye, 
  EyeOffIcon, 
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
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be 8 digit long.")
    .max(50, "Password must be 50 characters or less.")
    .regex(/[0-9]/, "Password must contain at least one digit.")
    .regex(/[a-z]/, "Password must contain at least one lowercase character.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase character."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormValues) {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (error) {
        setError(error.message || "Failed to create account");
        return;
      }

      const otpResult = await emailOtp.sendVerificationOtp({
        email: data.email,
        type: "email-verification",
      });

      if (otpResult.error) {
        setError(otpResult.error.message || "Failed to send verification OTP");
        return;
      }

      navigate(`/signup/verify-otp?email=${data.email}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "http://localhost:5175",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setIsLoading(false);
    }
  }

  const handleSampleFill = (role: 'teacher' | 'student') => {
    const samples = {
      teacher: { name: "Dr. Demo Faculty", email: "new_faculty@example.com", password: "Password123!", confirmPassword: "Password123!" },
      student: { name: "Demo Student", email: "new_student@example.com", password: "Password123!", confirmPassword: "Password123!" },
    };
    form.setValue("name", samples[role].name);
    form.setValue("email", samples[role].email);
    form.setValue("password", samples[role].password);
    form.setValue("confirmPassword", samples[role].confirmPassword);
  };

  return (
    <div className={cn("w-full flex min-h-[95vh] bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 overflow-hidden rounded-[3.5rem] shadow-2xl border border-slate-100", className)} {...props}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row">
        
        {/* ─── Left Form Panel ─── */}
        <div className="flex-[1.2] flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-white order-2 lg:order-1 overflow-y-auto">
          
          {/* Mobile Branding (Visible only on mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-10 mt-4">
            <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
              <GraduationCap size={24} className="ml-1" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Lumina Uni</span>
          </div>

          <div className="w-full max-w-md py-8">
            
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Join the Community</h2>
              <p className="text-slate-500 font-medium">Register for a new institutional account to access the academic network.</p>
            </div>

            {/* Quick Demo Section */}
            <div className="mb-8 bg-emerald-50/50 p-5 rounded-[1.5rem] border border-emerald-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={80} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                <Sparkles size={14} /> Quick Demo Data Fill
              </h3>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => handleSampleFill('teacher')}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all group"
                >
                  <BookOpen size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">Teacher</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleSampleFill('student')}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-emerald-100 shadow-sm hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 transition-all group"
                >
                  <User size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">Student</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle size={20} className="text-rose-500 mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-rose-700 leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Full Name</label>
                    <input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="e.g. Jane Doe"
                      autoComplete="name"
                      className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                    />
                    {fieldState.invalid && (
                      <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Institutional Email</label>
                    <input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="e.g. you@lumina.edu"
                      autoComplete="email"
                      className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                    />
                    {fieldState.invalid && (
                      <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Password</label>
                      <div className="relative">
                        <input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {showPassword ? <EyeOffIcon size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {fieldState.invalid && (
                        <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in leading-tight">{fieldState.error?.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Confirm</label>
                      <div className="relative">
                        <input
                          {...field}
                          id="confirmPassword"
                          type={showPasswordConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {showPasswordConfirm ? <EyeOffIcon size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {fieldState.invalid && (
                        <p className="px-1 text-xs font-bold text-rose-500 animate-in fade-in leading-tight">{fieldState.error?.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="group w-full h-14 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 overflow-hidden relative"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 relative z-10" />
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or use institution SSO</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm font-medium text-slate-500">
                Already registered?{" "}
                <Link to="/login" className="font-bold text-slate-900 hover:text-emerald-600 transition-colors underline decoration-2 underline-offset-4 decoration-emerald-200">
                  Return to sign in
                </Link>
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                By registering, you agree to our <br/>
                <Link to="#" className="text-slate-600 hover:text-emerald-600 underline decoration-slate-300 underline-offset-4 transition-colors">Terms of Service</Link> &{" "}
                <Link to="#" className="text-slate-600 hover:text-emerald-600 underline decoration-slate-300 underline-offset-4 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Branding Panel (Hidden on Mobile) ─── */}
        <div className="hidden lg:flex flex-[0.8] flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden order-1 lg:order-2">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-emerald-950 to-slate-900 opacity-90 z-0" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px] z-0" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[100px] z-0" />
            
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0zOUgxVjM5aDM4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] z-0 opacity-50" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 justify-end">
              <span className="text-xl font-black tracking-tight text-white">Lumina University</span>
              <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
                <GraduationCap size={24} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl text-right ml-auto mt-10">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              Begin your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-500">
                Journey
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 ml-auto max-w-md">
              Create your unified academic profile to register for classes, view syllabi, and interact with distinguished faculty.
            </p>

            <div className="flex flex-wrap justify-end gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck size={20} className="text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Identity Verification</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-right mt-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 Lumina Admissions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
