import nodemailer from "nodemailer";

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      // secure:true,
      port: 465,
      auth: {
        user: "karankum790941@gmail.com",
        pass: process.env.GMAIL_PASS_KEY,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    //  const otp = generateOtp();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Could not send OTP email");
  }
};

const sendMail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      auth: {
        user: "karankum790941@gmail.com",
        pass: process.env.GMAIL_PASS_KEY,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject || "Reply to Query",
      text: message,
      // attachments: [
      //   {
      //     filename: "quotation.pdf",
      //     path: filePath,
      //   },
      // ],
    };
    console.log("message sending on mail!");
    await transporter.sendMail(mailOptions);
    console.log("message sent!");
  } catch (error) {
    console.error("Error sending message email:", error);
    throw new Error("Could not send  email");
  }
};

export { sendOtpEmail, sendMail };
