import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface sendEmailParams {
    to: string;
    subject: string;
    text: string;
}

export async function sendEmail({to, subject, text}: sendEmailParams){
    try {
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            text,
        });
        console.log("Email Response", response);
    } catch (error) {
        console.log("Email Error", error);
    }
}