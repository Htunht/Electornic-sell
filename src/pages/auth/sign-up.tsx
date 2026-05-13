import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <SignupForm className="max-w-[1200px] w-full" />
    </div>
  );
}
