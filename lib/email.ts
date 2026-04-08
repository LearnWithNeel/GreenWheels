import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendOTPEmail({
  to,
  name,
  otp,
  purpose,
}: {
  to: string;
  name: string;
  otp: string;
  purpose: "register" | "login" | "reset" | "support_access" | "admin-login"
}): Promise<boolean> {
  const subject =
  purpose === "register"
    ? "Verify your GreenWheels account"
    : purpose === "admin-login"
    ? "GreenWheels Admin Login OTP"
    : purpose === "support_access"
    ? "GreenWheels Support Access OTP"
    : "Your GreenWheels login OTP";

const purposeText =
  purpose === "register"
    ? "complete your registration"
    : purpose === "admin-login"
    ? "login to the admin dashboard"
    : purpose === "support_access"
    ? "authorize support team profile access"
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

// ── Order status email ───────────────────────────────────────────────────────
export async function sendOrderStatusEmail({
  to, name, orderNumber, status, orderId,
}: {
  to: string; name: string; orderNumber: string;
  status: string; orderId: string;
}): Promise<boolean> {
  const statusMessages: Record<string, { subject: string; body: string }> = {
    inquiry_submitted: {
      subject: "Retrofit Inquiry Submitted — GreenWheels",
      body:    `Your retrofit inquiry ${orderNumber} has been submitted. Our verified dealers have been notified and will contact you shortly.`,
    },
    dealer_accepted: {
      subject: "Dealer Accepted Your Order! 🎉",
      body:    `A verified dealer has accepted your order ${orderNumber}. They will schedule a verification visit at your location soon.`,
    },
    verification_scheduled: {
      subject: "Verification Scheduled 📅",
      body:    `Your on-site verification for order ${orderNumber} has been scheduled. Please keep your vehicle ready.`,
    },
    verification_passed: {
      subject: "Verification Passed! ✅ Pay Token Now",
      body:    `Your vehicle passed verification for order ${orderNumber}. Please login to pay the 30% token amount to confirm your booking.`,
    },
    verification_failed: {
      subject: "Verification Result ❌",
      body:    `Unfortunately your vehicle did not pass verification for order ${orderNumber}. No payment has been charged. Our team will contact you.`,
    },
    token_paid: {
      subject: "Token Payment Confirmed 💰",
      body:    `Your token payment for order ${orderNumber} has been received. The dealer will schedule vehicle pickup shortly.`,
    },
    retrofit_in_progress: {
      subject: "Retrofit Work Started ⚡",
      body:    `Your vehicle for order ${orderNumber} is now being retrofitted. We will notify you when the work is complete.`,
    },
    rto_filed: {
      subject: "RTO Filed — Final Payment Due 📄",
      body:    `All RTO paperwork for order ${orderNumber} has been filed. Please login to make the final 70% payment to receive your vehicle.`,
    },
    delivered: {
      subject: "Vehicle Delivered! Welcome to the EV World 🎉",
      body:    `Congratulations! Your EV-converted vehicle for order ${orderNumber} has been delivered. Your invoice is ready for download in your dashboard.`,
    },
    cancelled: {
      subject: "Order Cancelled",
      body:    `Your order ${orderNumber} has been cancelled. If you paid a token, refund will be processed within 5-7 business days.`,
    },
  };

  const template = statusMessages[status];
  if (!template) return true;

  try {
    await transporter.sendMail({
      from:    `"GreenWheels" <${process.env.GMAIL_USER}>`,
      to,
      subject: template.subject,
      html: `
        <div style="max-width:480px;margin:40px auto;padding:0 16px;
                    font-family:Arial,sans-serif;background:#021a08;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="color:#4ade80;font-size:22px;font-weight:900;">
              🌿 GreenWheels
            </div>
          </div>
          <div style="background:#031f0a;border:1px solid #14532d;
                      border-radius:16px;padding:28px;">
            <p style="color:#86efac;font-size:15px;margin:0 0 8px;">
              Hello, ${name} 👋
            </p>
            <p style="color:#f8fafc;font-size:16px;font-weight:700;
                      margin:0 0 16px;">
              ${template.subject}
            </p>
            <p style="color:#86efac;font-size:14px;margin:0 0 20px;
                      line-height:1.6;">
              ${template.body}
            </p>
            <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}"
              style="display:inline-block;background:#a3e635;color:#021a0e;
                     padding:12px 24px;border-radius:10px;font-weight:900;
                     text-decoration:none;font-size:14px;">
              View Order →
            </a>
          </div>
          <p style="color:#14532d;font-size:12px;text-align:center;
                    margin-top:16px;">
            © 2026 GreenWheels. Making India electric.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[GW-Email] sendOrderStatusEmail error:", error);
    return false;
  }
}

// ── Welcome email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({
  to, name, role,
}: {
  to: string; name: string; role: string;
}): Promise<boolean> {
  const roleMessages: Record<string, string> = {
    customer: "Start your EV conversion journey today — submit your first retrofit inquiry for free!",
    dealer:   "Your dealer profile is under review. You will be notified once approved by our admin team.",
    vendor:   "Your vendor account is under review. Once approved, you can start listing your products.",
  };

  try {
    await transporter.sendMail({
      from:    `"GreenWheels" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Welcome to GreenWheels, ${name}! 🌿`,
      html: `
        <div style="max-width:480px;margin:40px auto;padding:0 16px;
                    font-family:Arial,sans-serif;background:#021a08;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="color:#4ade80;font-size:22px;font-weight:900;">
              🌿 GreenWheels
            </div>
          </div>
          <div style="background:#031f0a;border:1px solid #14532d;
                      border-radius:16px;padding:28px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">🎉</div>
            <h2 style="color:#f8fafc;font-size:20px;margin:0 0 12px;">
              Welcome to GreenWheels!
            </h2>
            <p style="color:#86efac;font-size:14px;margin:0 0 16px;">
              Hello ${name}, your account has been created successfully.
            </p>
            <p style="color:#86efac;font-size:14px;line-height:1.6;
                      margin:0 0 24px;">
              ${roleMessages[role] || "Welcome to the platform!"}
            </p>
            <a href="${process.env.NEXTAUTH_URL}"
              style="display:inline-block;background:#a3e635;color:#021a0e;
                     padding:12px 24px;border-radius:10px;font-weight:900;
                     text-decoration:none;font-size:14px;">
              Go to GreenWheels →
            </a>
          </div>
          <p style="color:#14532d;font-size:12px;text-align:center;
                    margin-top:16px;">
            © 2026 GreenWheels. Making India electric.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[GW-Email] sendWelcomeEmail error:", error);
    return false;
  }
}

// ── Dealer approved/rejected email ───────────────────────────────────────────
export async function sendDealerStatusEmail({
  to, name, status, reason,
}: {
  to: string; name: string;
  status: "approved" | "rejected"; reason?: string;
}): Promise<boolean> {
  try {
    await transporter.sendMail({
      from:    `"GreenWheels" <${process.env.GMAIL_USER}>`,
      to,
      subject: status === "approved"
        ? "Your Dealer Profile is Approved! ✅"
        : "Dealer Profile Review Update",
      html: `
        <div style="max-width:480px;margin:40px auto;padding:0 16px;
                    font-family:Arial,sans-serif;background:#021a08;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="color:#4ade80;font-size:22px;font-weight:900;">
              🌿 GreenWheels
            </div>
          </div>
          <div style="background:#031f0a;border:1px solid #14532d;
                      border-radius:16px;padding:28px;">
            <p style="color:#86efac;font-size:15px;margin:0 0 8px;">
              Hello, ${name} 👋
            </p>
            ${status === "approved" ? `
              <h2 style="color:#a3e635;font-size:18px;margin:0 0 12px;">
                🎉 Your dealer profile has been approved!
              </h2>
              <p style="color:#86efac;font-size:14px;line-height:1.6;
                        margin:0 0 20px;">
                You can now start receiving EV retrofit orders from customers
                in your area. Login to your dealer dashboard to get started.
              </p>
              <a href="${process.env.NEXTAUTH_URL}/login"
                style="display:inline-block;background:#a3e635;color:#021a0e;
                       padding:12px 24px;border-radius:10px;font-weight:900;
                       text-decoration:none;font-size:14px;">
                Login to Dashboard →
              </a>
            ` : `
              <h2 style="color:#fca5a5;font-size:18px;margin:0 0 12px;">
                Profile Not Approved
              </h2>
              <p style="color:#86efac;font-size:14px;line-height:1.6;
                        margin:0 0 12px;">
                Unfortunately your dealer profile was not approved at this time.
              </p>
              ${reason ? `
                <div style="background:#1a0505;border:1px solid #991b1b;
                            border-radius:10px;padding:14px;margin-bottom:16px;">
                  <p style="color:#fca5a5;font-size:13px;margin:0;">
                    Reason: ${reason}
                  </p>
                </div>
              ` : ""}
              <p style="color:#86efac;font-size:13px;margin:0;">
                You may reapply after addressing the issues mentioned above.
              </p>
            `}
          </div>
          <p style="color:#14532d;font-size:12px;text-align:center;
                    margin-top:16px;">
            © 2026 GreenWheels. Making India electric.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[GW-Email] sendDealerStatusEmail error:", error);
    return false;
  }
}