const nodemailer = require("nodemailer");

const sendEmail = async (options)  => {
  console.log("Sending Email");
  console.log(process.env.SMTP_HOST);
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
  });

  // send mail with defined transport object
  let message = {
    from: `${process.env.FROM_NAME}<${process.env.SMTP_EMAIL}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    html: `<h1>${options.message}</h1>`
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = sendEmail;
