import { ForgetPassword } from "@/components/auth/forgot-password";

export default function ForgetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <ForgetPassword className="max-w-[1200px] w-full" />
    </div>
  );
}
