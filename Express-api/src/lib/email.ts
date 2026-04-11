import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface sendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string; // html
}

export async function sendEmail({to, subject, text, html}: sendEmailParams){
    try {
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