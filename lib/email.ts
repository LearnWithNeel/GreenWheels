import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail({
  to,
  name,
  otp,
  purpose,
}: {
  to:      string;
  name:    string;
  otp:     string;
  purpose: "register" | "login" | "admin-login";
}): Promise<boolean> {
  const subject =
    purpose === "register"
      ? "Verify your GreenWheels account"
      : purpose === "admin-login"
      ? "GreenWheels Admin Login OTP"
      : "Your GreenWheels login OTP";

  const purposeText =
    purpose === "register"
      ? "complete your registration"
      : purpose === "admin-login"
      ? "login to the admin dashboard"
      : "login to your account";

  try {
    await transporter.sendMail({
      from: `"GreenWheels" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0;padding:0;background:#021a08;font-family:'Outfit',Arial,sans-serif;">
            <div style="max-width:480px;margin:40px auto;padding:0 16px;">

              <!-- Header -->
              <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#4ade80,#a3e635);
                            border-radius:12px;padding:10px 14px;font-size:24px;margin-bottom:12px;">
                  🌿
                </div>
                <div style="color:#4ade80;font-size:22px;font-weight:900;letter-spacing:-0.5px;">
                  GreenWheels
                </div>
              </div>

              <!-- Card -->
              <div style="background:#031f0a;border:1px solid #14532d;
                          border-radius:16px;padding:32px 28px;text-align:center;">
                <p style="color:#86efac;font-size:15px;margin:0 0 8px;">
                  Hello, ${name} 👋
                </p>
                <h2 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 20px;">
                  Your OTP to ${purposeText}
                </h2>

                <!-- OTP Box -->
                <div style="background:#052e16;border:2px solid #a3e635;
                            border-radius:12px;padding:20px;margin:0 0 24px;">
                  <div style="color:#a3e635;font-size:42px;font-weight:900;
                              letter-spacing:12px;font-family:monospace;">
                    ${otp}
                  </div>
                </div>

                <p style="color:#4ade80;font-size:13px;margin:0 0 8px;">
                  This OTP is valid for <strong>2 minutes</strong> only.
                </p>
                <p style="color:#4ade80;font-size:13px;margin:0;">
                  Never share this OTP with anyone.
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align:center;margin-top:24px;">
                <p style="color:#14532d;font-size:12px;margin:0;">
                  If you did not request this OTP, please ignore this email.
                </p>
                <p style="color:#14532d;font-size:12px;margin:4px 0 0;">
                  © 2026 GreenWheels. Making India electric.
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("[GW-Email] Failed to send OTP email:", error);
    return false;
  }
}