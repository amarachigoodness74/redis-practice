import { Job } from "bullmq";
import nodemailer from "nodemailer";
import logger from "../../../utils/logger";

const sendEmailProcessor = async (job: Job) => {
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"John Doe" <johndoe@example.com>',
    to: "test@example.com",
    subject: "Hello Tester",
    html: `<p>${job.data}</p>`
  });

  logger.info(`Message sent: ${info.messageId}`);

  return nodemailer.getTestMessageUrl(info);
};

export default sendEmailProcessor;