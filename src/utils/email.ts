import nodemailer from "nodemailer";

const frontUrl = process.env.WHATSNEW_FRONTEND_URL;
const projectEmail = process.env.WHATSNEW_EMAIL;
const projectPwd = process.env.WHATSNEW_EMAIL_PASS;

export const requestPwdReset = async (token: string, userEmail: string) => {
  const resetLink = `${frontUrl}/auth/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: projectEmail,
      pass: projectPwd,
    },
  });

  const mailOptions = {
    from: projectEmail,
    to: userEmail,
    subject: "What's New | Password Reset Request",
    html: `<p>Click <a href="${resetLink}" target="_blan">here</a> to reset your password.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { message: "Password reset link sent to email" };
  } catch (error) {
    return { message: "Failed to send reset email" };
  }
};
