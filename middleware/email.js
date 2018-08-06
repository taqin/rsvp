const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
require('dotenv').config();

let emailUser = process.env.EMAILUSER;
let emailPass = process.env.EMAILPASS;

const Emailer = (email) => {

  const emailAddress = email.email;
  const emailAcct = email.type;
  const emailFrom = email.from;

  // Takes in 1 or 2 for toggling email
  if (emailAcct == 'thai') {
    emailUser = process.env.EMAILUSER2;
    emailPass = process.env.EMAILPASS2;
  }

  const transporter = nodemailer.createTransport({
    // example with google mail service
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser, // replace by your email to practice
      pass: emailPass // replace by your-password
    }
  })

  const mailOptions = {
    from: '"' + emailFrom + '"' + emailUser,
    to: emailAddress + ', taqin83@gmail.com',
    subject: 'Sending Email using Nodemailer via App',

    /*
       for plain text body
     ->	text: 'Just Testing!'
    */
    // html body
    html: '<h1>Hello world!</h1><p>The mail has been sent from Node.js application!</p>'
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(error);

    console.log('Email sent: ' + info.response);
  });
}

module.exports = {Emailer};