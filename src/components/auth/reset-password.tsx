import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router";
import { Eye, EyeOffIcon } from "lucide-react";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [status, setStatus] = React.useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: z.infer<typeof resetSchema>) {
    setIsLoading(true);
    setStatus(null);

    // Better Auth Client က URL ထဲက ?token=... ကို auto ဖမ်းသွားမှာဖြစ်လို့
    // ကျွန်တော်တို့က password အသစ်ပဲ ပို့ပေးဖို့ လိုပါတယ်
    const { error } = await authClient.emailOtp.resetPassword({
      email: email,
      otp: token,
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      setStatus({
        type: "error",
        message: error.message || "Invalid or expired token.",
      });
    } else {
      setStatus({
        type: "success",
        message: "Password updated! Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 2000);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below to reset your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <Alert
              variant={status.type === "error" ? "destructive" : "default"}
              className="mb-4"
            >
              {status.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>
                {status.type === "error" ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <InputGroup data-invalid={fieldState.invalid}>
                        <InputGroupInput
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {/* FIXED: Toggle icons based on showPassword */}
                            {showPassword ? (
                              <EyeOffIcon size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword" // FIXED: Was mapped to "password" previously
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <InputGroup data-invalid={fieldState.invalid}>
                        <InputGroupInput
                          {...field}
                          type={showPasswordConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          required
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            aria-label={
                              showPasswordConfirm
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowPasswordConfirm((prev) => !prev)
                            }
                          >
                            {/* FIXED: Toggle icons based on showPasswordConfirm */}
                            {showPasswordConfirm ? (
                              <EyeOffIcon size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full relative overflow-hidden transition-all duration-200 active:scale-[0.98] font-semibold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span>Resetting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Update Password</span>
                    {/* Adding a small arrow or checkmark makes the CTA feel more "active" */}
                    <CheckCircle2 className="h-4 w-4 opacity-70" />
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
