import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587, // Use STARTTLS
    secure: false, // false for STARTTLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    debug: true, // Enable debugging
    logger: true, // Log SMTP traffic
  });
  