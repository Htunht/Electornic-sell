import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins"
import { sendEmail } from "./email";
import prisma from "./prisma";
import { getResetPasswordEmailHtml } from "./email-templates";
import { getVerificationEmailHtml } from "./verify-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      // emailOTP plugin မှာ Link ပို့ချင်ရင်လည်း sendVerificationOTP ကိုပဲ သုံးရပါတယ်
      async sendVerificationOTP({ email, otp, type }) {
        const resetLink = `http://localhost:5174/reset-password?token=${otp}&email=${email}`;
        if (type === "forget-password") {
          const htmlContent = getResetPasswordEmailHtml(email, resetLink);
          // Password Reset အတွက် Link (URL) ကို ပို့ပေးမည့်အပိုင်း
          void sendEmail({
            to: email,
            subject: "Reset Your Password",
            text: htmlContent, // HTML email သုံးလျှင် ဒါကို သုံးပါ
          });
        } else {
          const htmlContent = getVerificationEmailHtml(otp);
          // Email Verification အတွက် OTP ပို့ပေးမည့်အပိုင်း
          await sendEmail({
            to: email,
            subject: "Verify Your Email",
            text: htmlContent,
          });
        }
      },
    }),
  ],
  socialProviders: {
  google: { 
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
      prompt: "select_account",
        }, 
  },
  trustedOrigins: ["http://localhost:5174"],
});
