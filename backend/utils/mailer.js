// utils/sendEmail.js
const nodemailer = require('nodemailer');

async function sendEmail(to, subject, verificationUrl) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "kumawatpriyanshu88@gmail.com", // your Gmail address
        pass: "nrlz owzh zjor mhbe" // your Gmail App Password (NOT your normal Gmail password)
      }
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"MyApp" <kumawatpriyanshu88@gmail.com>`,
      to,
      subject,
      html: `
    <h2>Verify your email</h2>
    <p>Click below link to verify your account:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <br><br>
    Or copy this link: ${verificationUrl}
  `
    });

    console.log("📧 Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
}

module.exports = sendEmail;
