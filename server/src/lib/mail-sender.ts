import nodemailer from "nodemailer";
import config from "../config";

class MailSender {
  private transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASSWORD,
      },
    } as nodemailer.TransportOptions);
  }

  async sendVerificationEmail(email: string, token: string) {
    const mailOptions = {
      from: config.MAIL_USER,
      to: email,
      subject: "Verify Email",
      text: `Click this link to verify your email: ${config.FRONTEND_URL}/auth/verify-account/${token}`,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendInviteEmail(email: string, token: string) {
    const mailOptions = {
      from: config.MAIL_USER,
      to: email,
      subject: "Invite Email",
      text: `Click this link to activate your account : ${config.FRONTEND_URL}/auth/activate-account/${token}`,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const mailOptions = {
      from: config.MAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Click this link to reset your password: ${config.FRONTEND_URL}/auth/reset-password/${token}`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

const mailSender = new MailSender();

export default mailSender;
