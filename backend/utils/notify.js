const twilio = require('twilio');
const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize email transporter
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Notification templates
const templates = {
  visitor_checkin: {
    email: {
      subject: 'New Visitor Check-in - {{visitorName}}',
      html: `
        <h2>New Visitor Arrived</h2>
        <p><strong>{{visitorName}}</strong> has checked in to meet you.</p>
        <ul>
          <li>Phone: {{visitorPhone}}</li>
          <li>Purpose: {{purpose}}</li>
          <li>Time: {{checkInTime}}</li>
        </ul>
        <p>Please approve or reject this visit from your dashboard.</p>
      `
    },
    sms: 'New visitor {{visitorName}} checked in to meet you. Purpose: {{purpose}}. Please approve/reject via app.'
  },
  visitor_approved: {
    email: {
      subject: 'Visit Approved - Welcome to {{companyName}}',
      html: `
        <h2>Your visit has been approved!</h2>
        <p>You can now proceed to meet {{hostName}}.</p>
        <p>Badge Number: {{badgeNumber}}</p>
      `
    },
    sms: 'Your visit to {{companyName}} has been approved. Badge: {{badgeNumber}}'
  },
  visitor_rejected: {
    email: {
      subject: 'Visit Update - {{companyName}}',
      html: `
        <h2>Visit Status Update</h2>
        <p>Unfortunately, your visit request has been declined.</p>
        <p>Reason: {{rejectionReason}}</p>
      `
    },
    sms: 'Your visit to {{companyName}} has been declined. Reason: {{rejectionReason}}'
  }
};

// Send email notification
const sendEmail = async (to, subject, html, templateData = {}) => {
  try {
    // Replace template variables
    const compiledSubject = compileTemplate(subject, templateData);
    const compiledHtml = compileTemplate(html, templateData);

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject: compiledSubject,
      html: compiledHtml
    };

    const result = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send SMS notification
const sendSMS = async (to, message, templateData = {}) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const compiledMessage = compileTemplate(message, templateData);

    const result = await twilioClient.messages.create({
      body: compiledMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

// Send WhatsApp notification
const sendWhatsApp = async (to, message, templateData = {}) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const compiledMessage = compileTemplate(message, templateData);

    const result = await twilioClient.messages.create({
      body: compiledMessage,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

// Compile template with data
const compileTemplate = (template, data) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
};

// Main notification function
const sendNotification = async (notificationData) => {
  const {
    companyId,
    visitorId,
    userId,
    type,
    channel,
    recipient,
    templateData = {},
    priority = 'normal'
  } = notificationData;

  try {
    // Get template
    const template = templates[type];
    if (!template || !template[channel]) {
      throw new Error(`Template not found for ${type}:${channel}`);
    }

    let result;
    let subject = null;
    let message = null;

    if (channel === 'email') {
      subject = template.email.subject;
      message = template.email.html;
      result = await sendEmail(recipient, subject, message, templateData);
    } else if (channel === 'sms') {
      message = template.sms;
      result = await sendSMS(recipient, message, templateData);
    } else if (channel === 'whatsapp') {
      message = template.sms; // Use SMS template for WhatsApp
      result = await sendWhatsApp(recipient, message, templateData);
    }

    // Log notification
    const notificationLog = await NotificationLog.create({
      companyId,
      visitorId,
      userId,
      type,
      channel,
      recipient,
      subject: compileTemplate(subject || '', templateData),
      message: compileTemplate(message, templateData),
      status: result.success ? 'sent' : 'failed',
      provider: channel === 'email' ? 'smtp' : 'twilio',
      providerId: result.messageId,
      errorMessage: result.error,
      priority
    });

    return {
      success: result.success,
      notificationId: notificationLog._id,
      error: result.error
    };

  } catch (error) {
    console.error('Notification error:', error);
    
    // Log failed notification
    try {
      await NotificationLog.create({
        companyId,
        visitorId,
        userId,
        type,
        channel,
        recipient,
        message: 'Failed to process notification',
        status: 'failed',
        errorMessage: error.message,
        priority
      });
    } catch (logError) {
      console.error('Failed to log notification error:', logError);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendNotification,
  sendEmail,
  sendSMS,
  sendWhatsApp,
  templates
};