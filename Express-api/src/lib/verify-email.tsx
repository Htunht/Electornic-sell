export const getVerificationEmailHtml = (otp: string) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; padding: 60px 20px; color: #18181b;">
      <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center; border: 1px solid #e4e4e7;">
        
        <div style="margin-bottom: 24px;">
          <div style="background-color: #18181b; width: 48px; height: 48px; border-radius: 10px; display: inline-block; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">FS</div>
        </div>

        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #bbbbc0ff;">Verify your email</h1>
        <p style="font-size: 14px; color: #71717a; margin-bottom: 32px;">Enter the following code to finish setting up your account.</p>
        
        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #18181b; border: 1px solid #e4e4e7;">
          ${otp}
        </div>

        <p style="font-size: 12px; color: #a1a1aa; margin-top: 32px;">
          This code will expire in 10 minutes. <br />
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 12px; color: #a1a1aa;">&copy; 2026 Furniture Shop Inc.</p>
      </div>
    </div>
  `;
};