const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

require('dotenv').config();

let emailUser = process.env.EMAILUSER;
let emailPass = process.env.EMAILPASS;

const Emailer = (email) => {

  const emailAddress = email.email;
  const emailAcct = email.type;
  const emailFrom = email.from;
  const emailTo = email.to;

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
    to: emailAddress,
    subject: 'Confirmation on Registration for Thai October 2018 Event',

    // Email HTML body
    html: '<h4>Thai October Event 2018</h4>'
    +'<p>Hi '+ emailTo + ' !</p>'
    +'<p>This email confirms your registration to attend the special ISTA meeting in Chiang Mai, Thailand on 12th to 14th October 2018.</p>'
    +'<p>You are now registered for the event. If unforeseen circumstances arise and you cannot attend the event, kindly reply this email to withdraw your participation. This will help us update our registry.</p>'
    +'<p>The Welcome Kit is prepared and contains information, such as venue address, etc.</p>'
    +'<p><a href="http://tour.ishwarji.com/welcome/thailand_welcome_kit.pdf">Please download it here.</a></p>'
    +'<p>Thank you for your registration.See you in October!</p>'
    +'<br/>'
    +'<p>Regards,</p>'
    +'<p>Tim Chan</p>'
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(error);

    console.log('Email sent: ' + info.response);
  });
}

module.exports = {Emailer};