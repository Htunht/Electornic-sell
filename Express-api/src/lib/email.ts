import { Resend } from "resend";

// Ensure env is available even if this module is imported outside `src/index.ts`.
import "dotenv/config";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to Express-api/.env (or your deployment env vars).",
    );
  }
  return new Resend(apiKey);
}

interface sendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string; // html
}

export async function sendEmail({to, subject, text, html}: sendEmailParams){
    try {
        const resend = getResendClient();
        const response = await resend.emails.send({
            from: "Furniture-Shop@resend.dev",
            to,
            subject,
            text,
            html: html || text,
        });
        console.log("Email Response", response);
    } catch (error) {
        console.log("Email Error", error);
    }
}