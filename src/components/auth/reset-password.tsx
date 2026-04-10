import { useState } from "react";
import { useNavigate } from "react-router";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, LockKeyhole } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setStatus(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus({
      type: "success",
      message: "Password reset successfully. Redirecting...",
    });
    setTimeout(() => navigate("/login"), 3000);
    setIsLoading(false);
  }

  return (
    <div className={cn("flex min-h-svh items-center justify-center p-6", className)} {...props}>
      <Card className="w-full max-w-[400px] border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-zinc-100">
            <LockKeyhole className="size-5 text-zinc-900" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">New Password</CardTitle>
            <CardDescription className="text-balance">
              Please choose a strong password you haven't used before.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {status && (
            <Alert variant={status.type === "error" ? "destructive" : "default"} className="mb-6 py-3">
              {status.type === "error" ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4 text-green-600" />}
              <AlertDescription className={cn(status.type === "success" && "text-green-700")}>
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup className="space-y-4">
              {/* New Password Field */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        className="h-11 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {fieldState.error && <p className="text-[12px] text-destructive font-medium">{fieldState.error.message}</p>}
                  </Field>
                )}
              />

              {/* Confirm Password Field */}
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPasswordConfirm ? "text" : "password"}
                        className="h-11 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {fieldState.error && <p className="text-[12px] text-destructive font-medium">{fieldState.error.message}</p>}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}