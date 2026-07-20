import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendResetEmail(toEmail, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Intervuo" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your Intervuo password",
    html: `
      <p>You requested to reset your password.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}