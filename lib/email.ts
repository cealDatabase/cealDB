// lib/email.ts (server-only)
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Email configuration missing: SMTP_USER and SMTP_PASS required');
      return false;
    }

    const mailOptions = {
      from: `"CEAL Database System" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  username: string, 
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CEAL Database - Password Reset Required</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px 0; }
        .button { 
          display: inline-block; 
          background-color: #007bff; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { font-size: 12px; color: #666; margin-top: 30px; }
        .security-note { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CEAL Database System</h1>
          <h2>Password Reset Required</h2>
        </div>
        
        <div class="content">
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>As part of our security enhancement, all user passwords have been reset. You must create a new password to continue accessing your CEAL Database account.</p>
          
          <p><strong>What you need to do:</strong></p>
          <ol>
            <li>Click the button below to set your new password</li>
            <li>Choose a strong password (minimum 12 characters)</li>
            <li>Include uppercase, lowercase, numbers, and special characters</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Set New Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetUrl}</p>
          
          <div class="security-note">
            <strong>Security Note:</strong> This link will expire in 24 hours. If you don't set a new password within this time, you'll need to contact your CEAL administrator.
          </div>
          
          <p>If you have any questions or need assistance, please contact your CEAL administrator.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from the CEAL Database System. Please do not reply to this email.</p>
          <p>If you did not expect this email, please contact your administrator immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'CEAL Database - Password Reset Required',
    html: htmlContent,
  });
}

export async function sendWelcomeEmail(
  email: string, 
  username: string, 
  resetToken?: string
): Promise<boolean> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to CEAL Database</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px 0; }
        .button { 
          display: inline-block; 
          background-color: #28a745; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CEAL Database</h1>
        </div>
        
        <div class="content">
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>Your CEAL Database account has been created successfully! To complete your account setup, you need to create a secure password.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Create Your Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetUrl}</p>
          
          <p><strong>Password Requirements:</strong></p>
          <ul>
            <li>Minimum 12 characters long</li>
            <li>Include uppercase letters (A-Z)</li>
            <li>Include lowercase letters (a-z)</li>
            <li>Include numbers (0-9)</li>
            <li>Include special characters (!@#$%^&*)</li>
          </ul>
          
          <p>This link will expire in 24 hours. If you don't complete your password setup within this time, please contact your CEAL administrator.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from the CEAL Database System. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to CEAL Database - Set Your Password',
    html: htmlContent,
  });
}
