// utils/sendEmail.js
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, url) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kumawatpriyanshu88@gmail.com",
        pass: "nrlz owzh zjor mhbe",
      },
    });

    let htmlContent;

    if (subject === "Verify Your Email") {
      htmlContent = `
        <h2>Verify your email</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${url}">Verify Email</a>
        <br><br>
        Or copy this link: ${url}
      `;
    } else if (subject === "Password Reset") {
      htmlContent = `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${url}">Reset Password</a>
        <br><br>
        Or copy this link: ${url}
      `;
    } else {
      htmlContent = `<a href="${url}">${url}</a>`;
    }

    const info = await transporter.sendMail({
      from: `"MyApp" <kumawatpriyanshu88@gmail.com>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("📧 Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
}

module.exports = sendEmail;
