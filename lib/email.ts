// lib/email.ts (server-only)
import { Resend } from 'resend';
import { formatDateWithWeekday, formatSimpleDate } from './dateFormatting';

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "CEAL Statistics Database System <admin@cealstats.org>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    if (error) {
      console.error('Email sending failed:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  username: string, 
  resetToken: string,
  isInitialSetup = false
): Promise<boolean> {
  const resetUrl = `${ROOT_URL}/reset-password?token=${resetToken}`;
  
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "CEAL Statistics Database System <admin@cealstats.org>",
      to: email,
      subject: isInitialSetup ? 'CEAL Statistics Database - Set Up Your Password' : 'CEAL Statistics Database - Password Reset Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CEAL Statistics Database - ${isInitialSetup ? 'Set Up Your Password' : 'Password Reset Required'}</title>
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
              <h1>CEAL Statistics Database System</h1>
              <h2>${isInitialSetup ? 'Set Up Your Password' : 'Password Reset Required'}</h2>
            </div>
            
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>${isInitialSetup ? 
                'Welcome to the CEAL Statistics Database! To complete your account setup, you need to create a secure password.' :
                'As part of our security enhancement, you must create a new password to continue accessing your CEAL Statistics Database account.'
              }</p>
              
              <p><strong>What you need to do:</strong></p>
              <ol>
                <li>Click the button below to ${isInitialSetup ? 'create' : 'set'} your ${isInitialSetup ? 'initial' : 'new'} password</li>
                <li>Choose a strong password (minimum 8 characters)</li>
                <li>Include uppercase, lowercase, numbers, and special characters</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button text-white">${isInitialSetup ? 'Create Password' : 'Set New Password'}</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetUrl}</p>
              
              <div class="security-note">
                <strong>Security Note:</strong> This link will expire in 24 hours. If you don't ${isInitialSetup ? 'create' : 'set'} a password within this time, you'll need to contact your CEAL administrator.
              </div>
              
              <p>If you have any questions or need assistance, please contact your CEAL administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the CEAL Statistics Database System. Please do not reply to this email.</p>
              <p>If you did not expect this email, please contact your administrator immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Password reset email sending failed:', error);
      return false;
    }

    console.log('Password reset email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string, 
  username: string, 
  resetToken?: string
): Promise<boolean> {
  const resetUrl = `${ROOT_URL}/reset-password?token=${resetToken}`;
  
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "CEAL Statistics Database System <admin@cealstats.org>",
      to: email,
      subject: 'Welcome to CEAL Statistics Database - Set Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to CEAL Statistics Database</title>
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
              <h1>Welcome to CEAL Statistics Database</h1>
            </div>
            
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>Your CEAL Statistics Database account has been created successfully! To complete your account setup, you need to create a secure password.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button text-white">Create Your Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetUrl}</p>
              
              <p><strong>Password Requirements:</strong></p>
              <ul>
                <li>Minimum 8 characters long</li>
                <li>Include uppercase letters (A-Z)</li>
                <li>Include lowercase letters (a-z)</li>
                <li>Include numbers (0-9)</li>
                <li>Include special characters (!@#$%^&*)</li>
              </ul>
              
              <p>This link will expire in 24 hours. If you don't complete your password setup within this time, please contact your CEAL administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the CEAL StatisticsDatabase System. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Welcome email sending failed:', error);
      return false;
    }

    console.log('Welcome email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    return false;
  }
}

// New automated notification functions for form scheduling

export interface FormNotificationOptions {
  academicYear: number;
  openingDate: Date;
  closingDate: Date;
  recipientEmails: string[];
}

/**
 * Send notification to all CEAL members that forms are now open
 * Uses Resend Broadcast API for mass distribution
 */
export async function sendFormsOpenedNotification(
  options: FormNotificationOptions
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const totalDays = Math.ceil((options.closingDate.getTime() - options.openingDate.getTime()) / (1000 * 60 * 60 * 24));

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CEAL Statistics Database Forms Now Open</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .info-box { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .button { 
            display: inline-block; 
            background-color: #2563eb; 
            color: white !important; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📊 CEAL Statistics Database Forms</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Forms Now Open for ${options.academicYear}</h2>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Dear CEAL Member,</p>
            
            <p>The annual data collection forms are <strong>now open</strong> for academic year <strong>${options.academicYear}</strong>.</p>
            
            <div class="info-box">
              <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📅 Important Dates</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Forms Opened:</strong> ${formatDateWithWeekday(options.openingDate)} at 12:00 AM Pacific Time</li>
                <li><strong>Forms Close:</strong> ${formatDateWithWeekday(options.closingDate)} at 11:59 PM Pacific Time</li>
                <li><strong>Submission Period:</strong> ${totalDays} days</li>
              </ul>
            </div>
            
            <p><strong>What you need to do:</strong></p>
            <ol>
              <li>Sign in to the CEAL Statistics Database system</li>
              <li>Navigate to the Forms section</li>
              <li>Complete all required forms for your library</li>
              <li>Submit before the closing date</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ROOT_URL}/admin/forms" class="button">Access Forms Now</a>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">⚠️ Important: Please ensure all forms are completed and submitted before the closing date.</p>
            
            <p>If you have any questions or encounter any issues, please contact the CEAL Statistics Database administrators.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>
            <strong>CEAL Statistics Database Administration</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">This is an automated notification from the CEAL Statistics Database System.</p>
            <p style="margin: 5px 0;">Council on East Asian Libraries (CEAL)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to all recipients
    const emailPromises = options.recipientEmails.map(email => 
      resend.emails.send({
        from: "CEAL Statistics Database <notifications@cealstats.org>",
        to: email,
        subject: `🔓 CEAL Statistics Database Forms Open for ${options.academicYear} - Action Required`,
        html: emailTemplate
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Forms opened notification: ${successCount}/${options.recipientEmails.length} emails sent successfully`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Forms opened notification failed:', error);
    return false;
  }
}

/**
 * Send notification to all CEAL members that forms are now closed
 */
export async function sendFormsClosedNotification(
  options: FormNotificationOptions
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CEAL Statistics Database Forms Closed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .info-box { background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔒 CEAL Statistics Database Forms</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Forms Now Closed for ${options.academicYear}</h2>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Dear CEAL Member,</p>
            
            <p>The data collection forms for academic year <strong>${options.academicYear}</strong> are <strong>now closed</strong>.</p>
            
            <div class="info-box">
              <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">📅 Session Summary</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Forms Opened:</strong> ${formatSimpleDate(options.openingDate)}</li>
                <li><strong>Forms Closed:</strong> ${formatSimpleDate(options.closingDate)}</li>
                <li><strong>Status:</strong> Submissions are no longer accepted</li>
              </ul>
            </div>
            
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>All submitted data is being reviewed and processed</li>
              <li>You will receive updates on data compilation and reporting</li>
              <li>Forms will reopen for the next academic year according to the schedule</li>
            </ul>
            
            <p>Thank you for your participation in the CEAL Statistics Database data collection for ${options.academicYear}.</p>
            
            <p>If you have any questions or concerns about your submission, please contact the CEAL Statistics Database administrators as soon as possible.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>
            <strong>CEAL Statistics Database Administration</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">This is an automated notification from the CEAL Statistics Database System.</p>
            <p style="margin: 5px 0;">Council on East Asian Libraries (CEAL)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to all recipients
    const emailPromises = options.recipientEmails.map(email => 
      resend.emails.send({
        from: "CEAL Statistics Database <notifications@cealstats.org>",
        to: email,
        subject: `🔒 CEAL Statistics Database Forms Closed for ${options.academicYear}`,
        html: emailTemplate
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Forms closed notification: ${successCount}/${options.recipientEmails.length} emails sent successfully`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Forms closed notification failed:', error);
    return false;
  }
}

/**
 * Send admin notification when forms are automatically opened
 */
export async function sendAdminFormsOpenedNotification(
  adminEmails: string[],
  academicYear: number,
  stats: { librariesOpened: number; totalLibraries: number }
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Alert: Forms Automatically Opened</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .stats-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔓 Admin Alert</h1>
            <h2 style="margin: 10px 0 0 0; font-weight: normal;">Forms Automatically Opened</h2>
          </div>
          
          <div class="content">
            <p><strong>Dear CEAL Statistics Database Administrator,</strong></p>
            
            <p>The automated scheduling system has successfully opened the forms for academic year <strong>${academicYear}</strong>.</p>
            
            <div class="stats-box">
              <h3 style="color: #047857; margin-top: 0;">📊 System Status</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Academic Year:</strong> ${academicYear}</li>
                <li><strong>Libraries Opened:</strong> ${stats.librariesOpened} out of ${stats.totalLibraries}</li>
                <li><strong>Action Time:</strong> ${new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</li>
                <li><strong>Status:</strong> ✅ All members notified</li>
              </ul>
            </div>
            
            <p><strong>Actions Completed:</strong></p>
            <ul>
              <li>All Library_Year records updated to <code>is_open_for_editing = true</code></li>
              <li>Email notifications sent to all CEAL members</li>
              <li>Audit log entries created for tracking</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Monitor form submissions through the admin dashboard</li>
              <li>Forms will automatically close on the scheduled date</li>
              <li>Review audit logs for any issues</li>
            </ul>
            
            <p>You can view the <a href="${ROOT_URL}/admin/superguide">admin dashboard</a> to monitor form status and submissions.</p>
            
            <p style="margin-top: 30px;">This is an automated notification from the CEAL Statistics Database scheduling system.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">CEAL Statistics Database System - Automated Scheduling</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailPromises = adminEmails.map(email => 
      resend.emails.send({
        from: "CEAL Statistics Database System <system@cealstats.org>",
        to: email,
        subject: `✅ Admin Alert: Forms Automatically Opened for ${academicYear}`,
        html: emailTemplate
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Admin notification: ${successCount}/${adminEmails.length} emails sent`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Admin forms opened notification failed:', error);
    return false;
  }
}

/**
 * Send admin notification when forms are automatically closed
 */
export async function sendAdminFormsClosedNotification(
  adminEmails: string[],
  academicYear: number,
  stats: { librariesClosed: number; totalLibraries: number }
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Alert: Forms Automatically Closed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .stats-box { background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔒 Admin Alert</h1>
            <h2 style="margin: 10px 0 0 0; font-weight: normal;">Forms Automatically Closed</h2>
          </div>
          
          <div class="content">
            <p><strong>Dear CEAL Statistics Database Administrator,</strong></p>
            
            <p>The automated scheduling system has successfully closed the forms for academic year <strong>${academicYear}</strong>.</p>
            
            <div class="stats-box">
              <h3 style="color: #991b1b; margin-top: 0;">📊 System Status</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Academic Year:</strong> ${academicYear}</li>
                <li><strong>Libraries Closed:</strong> ${stats.librariesClosed} out of ${stats.totalLibraries}</li>
                <li><strong>Action Time:</strong> ${new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</li>
                <li><strong>Status:</strong> 🔒 All members notified</li>
              </ul>
            </div>
            
            <p><strong>Actions Completed:</strong></p>
            <ul>
              <li>All Library_Year records updated to <code>is_open_for_editing = false</code></li>
              <li>Email notifications sent to all CEAL members</li>
              <li>Audit log entries created for tracking</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review submission completeness through the admin dashboard</li>
              <li>Begin data validation and compilation process</li>
              <li>Follow up with libraries that didn't submit</li>
              <li>Prepare for next year's data collection cycle</li>
            </ul>
            
            <p>You can view the <a href="${ROOT_URL}/admin/superguide">admin dashboard</a> to review submission status.</p>
            
            <p style="margin-top: 30px;">This is an automated notification from the CEAL Statistics Database scheduling system.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">CEAL Statistics Database System - Automated Scheduling</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailPromises = adminEmails.map(email => 
      resend.emails.send({
        from: "CEAL Statistics Database System <system@cealstats.org>",
        to: email,
        subject: `🔒 Admin Alert: Forms Automatically Closed for ${academicYear}`,
        html: emailTemplate
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Admin notification: ${successCount}/${adminEmails.length} emails sent`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Admin forms closed notification failed:', error);
    return false;
  }
}

/**
 * Add a new user to Resend contacts for broadcast communications
 * This is a backend-only operation with no frontend feedback
 */
export async function addUserToResendContacts(
  email: string,
  firstName?: string | null,
  lastName?: string | null
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend contact creation skipped: RESEND_API_KEY not configured');
      return false;
    }

    if (!process.env.RESEND_BROADCAST_LIST_ID) {
      console.error('Resend contact creation skipped: RESEND_BROADCAST_LIST_ID not configured');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Create contact in Resend audience
    const { data, error } = await resend.contacts.create({
      email: email,
      firstName: firstName || '',
      lastName: lastName || '',
      unsubscribed: false,
      audienceId: process.env.RESEND_BROADCAST_LIST_ID,
    });

    if (error) {
      console.error('Failed to add contact to Resend:', error);
      return false;
    }

    console.log(`✅ Added user to Resend contacts: ${email} (Contact ID: ${data?.id})`);
    return true;
  } catch (error) {
    // Silent fail - don't break user signup if Resend fails
    console.error('Resend contact creation error:', error);
    return false;
  }
}
