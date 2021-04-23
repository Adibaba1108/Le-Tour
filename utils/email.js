const nodemailer = require('nodemailer');

const sendEmail = async options => {
 //1) Create a transporter->service that will send the emails

//We could do it with Gmail, which would look like this--:

 //  const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       password: process.env.EMAIL_PASSWORD
//     }
//     // Then, activate "less secure app" option in Gmail
//   }); 

//---However, we should only use Gmail for private apps. Gmail is not the best choice for a large-scale app because of its 500 emails-per-day limit. 
//--Large-scale apps should use a service like Sendgrid or Mailgun. For testing purposes, we’ll use a fake SMTP( Simple Mail Transfer Protocol ) server from Mailtrap.
 
 const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,//We’ll also save the host in a variable because Mailtrap isn’t a pre-defined service in nodemailer like Gmail is
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  // 2) Define the email options
  //many of which come from our options argument(an boject passed as an arg):
  const mailOptions = {
    from: 'Aditya Gupta <guptaaditya1108@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };
  // 3) Actually send the email..It’s an asynchronous function
  await transporter.sendMail(mailOptions);
  console.log("yo");
  
};

module.exports = sendEmail;
