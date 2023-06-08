const nodemailer = require("nodemailer");


  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "d14ffed7a333de4772168d1b19b7b2f4", // generated ethereal user
      pass: "1349cb156f45c9a2261b19b9fc2cea35", // generated ethereal password
    },
  });

module.exports = {

 send : async function(to, subject) {

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Innobing test 👻" <noreply@innobing.net>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
},


send_reset_password_token : async function(to, token) {

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Innobing test 👻" <noreply@innobing.net>', // sender address
    to: to, // list of receivers
    subject: "Your reset password instructions", // Subject line
    text: "Your reset password instructions", // plain text body
    html: "<b>Hello world?: </b>"+token, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

}
