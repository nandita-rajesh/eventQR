import nodemailer from "nodemailer";

const sendMail = async (
  email,
  subject,
  html,
  attachments = []
) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"EventQR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
    attachments,
  });
};

export default sendMail;