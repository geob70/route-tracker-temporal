import sgMail from '@sendgrid/mail';

import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Sends an email using SendGrid
 * @param to Recipient email address
 * @param subject Email subject
 * @param message Email body (plain text)
 * @param workflowId Workflow ID for logging purposes
 */
export async function sendEmail(to: string, subject: string, message: string, workflowId: string): Promise<void> {
  const email = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  };

  try {
    await sgMail.send(email);
    console.log(`Email sent to ${to} for workflow ${workflowId}`);
  } catch (error) {
    console.error(`Failed to send email to ${to} for workflow ${workflowId}:`, error);
  }
}
