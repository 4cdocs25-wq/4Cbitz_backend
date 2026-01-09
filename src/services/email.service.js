import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { welcomeEmailTemplate, paymentSuccessEmailTemplate } from '../templates/emailTemplates.js';

class EmailService {
  static transporter = null;

  // Initialize email transporter
  static initializeTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // Use STARTTLS (false for port 587, true for port 465)
        requireTLS: true, // Force TLS connection
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // For self-signed certificates
        }
      });

      logger.info('Email transporter initialized');
    }
    return this.transporter;
  }

  // Send email helper
  static async sendEmail(to, subject, html) {
    try {
      const transporter = this.initializeTransporter();

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || '4C BZ',
          address: process.env.EMAIL_FROM || process.env.SMTP_USER
        },
        to,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  // Send welcome email to new users
  static async sendWelcomeEmail(userEmail, userName) {
    try {
      const subject = 'Welcome to 4C BZ - Your Guide Awaits!';
      const html = welcomeEmailTemplate(userName);

      await this.sendEmail(userEmail, subject, html);
      logger.info(`Welcome email sent to ${userEmail}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send welcome email to ${userEmail}:`, error);
      // Don't throw error - email failure shouldn't break registration
      return { success: false, error: error.message };
    }
  }

  // Send payment success email
  static async sendPaymentSuccessEmail(userEmail, userName, paymentDetails) {
    try {
      const subject = 'Payment Successful - Welcome to 4C BZ Documents!';
      const html = paymentSuccessEmailTemplate(userName, paymentDetails);

      await this.sendEmail(userEmail, subject, html);
      logger.info(`Payment success email sent to ${userEmail}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send payment email to ${userEmail}:`, error);
      // Don't throw error - email failure shouldn't break payment flow
      return { success: false, error: error.message };
    }
  }

}

export default EmailService;
