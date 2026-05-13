import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <LoginForm className="max-w-[1200px] w-full" />
    </div>
  );
}
