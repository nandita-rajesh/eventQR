// import nodemailer from "nodemailer";

// const sendMail = async (
//   email,
//   subject,
//   html,
//   attachments = []
// ) => {

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"EventQR" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject,
//     html,
//     attachments,
//   });
// };

// export default sendMail;

import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (
  email,
  subject,
  html,
  attachments = []
) => {

  const { data, error } = await resend.emails.send({
    from: "EventQR <eventqr@chaayakada.fun>",
    to: email,
    subject,
    html,

    attachments: attachments.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
      contentId: file.contentId,
    })),
  });

  if (error) {
    console.log(error);
    throw new Error("Failed to send email");
  }

  return data;
};

export default sendMail;