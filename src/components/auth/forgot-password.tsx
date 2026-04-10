import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { emailOtp } from "@/lib/auth-client";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Zod Schema (z.email() မဟုတ်ဘဲ z.string().email() ဖြစ်ရပါမယ်)
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export function ForgetPassword() {
  // useState ကို [] array bracket နဲ့ ယူရမှာဖြစ်ပြီး value နဲ့ setter function ပဲ ယူရပါမယ်
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // onSubmit function (handleSubmit မဟုတ်ဘဲ onSubmit လို့ နာမည်ပေးလေ့ရှိပါတယ်)
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStatus(null);

    const { error } = await emailOtp.sendVerificationOtp({
      email: data.email,
      type: "forget-password",
    });

    setIsLoading(false);

    if (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong.",
      });
    } else {
      setStatus({
        type: "success",
        message: "A reset link has been sent to your email.",
      });
      form.reset();
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto mt-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <div className="mb-4">
              <Alert
                variant={status.type === "error" ? "destructive" : "default"}
                className={
                  status.type === "success"
                    ? "border-green-500 text-green-600"
                    : ""
                }
              >
                {status.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <AlertTitle>
                  {status.type === "error" ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="px-6 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
