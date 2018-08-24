const dotenv = require('dotenv');
require('dotenv').config();

const session = require('express-session');
const _ = require('lodash');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const csv = require('csv-express');

const { mongoose } = require('./db/mongoose');
const { Attendee } = require('./models/attendee');
const { AttendeeThai } = require('./models/attendee-thailand');
const { User } = require('./models/user');

const { Emailer } = require('./middleware/email.js');
const { authenticate } = require('./middleware/auth.js');

// Power up the Express server
const app = express();
app.use(session({ secret: '9zXw5cmHMrOObUWinxg1', cookie: { maxAge: 60000 } }));
const port = process.env.PORT;
const proxy = process.env.PROXY;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Check authorization
function secureAuth(req, res, next) {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    next();
  }
};

app.get('/sendemail', (res, req) => {
  try {
    Emailer({
      email: 'taqin83@gmail.com',
      type: 'thai',
      from: 'Thai Oct Event 2018'
    });
  } catch (error) {
    res.status(200).send('email sent! Check Inbox');
    res.status(404).send('WTF Email not set!');
  }
})

// Define the Routes
/* GET home page. */
app.get('/', (req, res, next) => {
  const fullUrl = proxy + req.get('host');
  console.log(fullUrl);
  res.render('pages/index', { 
    title: 'Welcome',
    host: fullUrl
   });
});

app.get('/event/:location', (req, res, next) => {
  const fullUrl = proxy + req.get('host');
  const eventLocation = req.params.location;
  let eventPage = 'sg'
  if (eventLocation == 'Singapore' || eventLocation == 'singapore') {
    eventPage = 'sg';
  } else if (eventLocation == 'Malaysia' || eventLocation == 'malaysia' ) {
    eventPage = 'my';
  } else if (eventLocation == 'Indonesia' || eventLocation == 'indonesia') {
           eventPage = 'id';
  } else if (eventLocation == 'Thailand' || eventLocation == 'thailand') {
    eventPage = 'th';
  }
  res.render(`pages/index-${eventPage}`, {
    title: eventLocation,
    host: fullUrl
  });
});


/* POST Registration Details */
app.post('/register/:location', (req, res) => {
  // res.send(req.body);
  const eachAttendee = req.body.name;
  const eventLocation = req.params.location;
  let numberReg = eachAttendee.length;
  // console.log('Number of Names: ' + numberReg);
  // res.send(eachAttendee);
  if (Array.isArray(eachAttendee)) {
    // Set fields to array

    eachAttendee.forEach(function(item, index) {
        const newRSVP = new Attendee({
          name: item,
          email: req.body.email,
          country: req.body.country[index],
          firstMeeting: req.body.firstMeeting[index],
          personalMeeting: req.body.personalMeeting[index],
          eventCode: eventLocation,
          firstEvent: req.body.firstEvent[index],
          secondEvent: req.body.secondEvent[index],
          contactPerson: req.body.email,
          isContactPerson: req.body.name[0]
        });
        newRSVP.save().then(person => {
        res.redirect(`/event/${eventLocation}/success`);
      }, e => {
        console.log('Unable to Register');
        res.status(500).send('Something broke!');
        res.status(404).send('WTF Not found!');
        res.send(e);
      });
    });
  } else {
    const newRSVP = new Attendee({
      name: req.body.name,
      email: req.body.email,
      country: req.body.country,
      firstMeeting: req.body.firstMeeting,
      personalMeeting: req.body.personalMeeting,
      eventCode: eventLocation,
      firstEvent: req.body.firstEvent,
      secondEvent: req.body.secondEvent,
      contactPerson: req.body.email,
      isContactPerson: req.body.name
    });
    newRSVP.save().then(person => {
      // console.log('Registered', req.body.name);
      // res.send('Success!');
      res.redirect(`/event/${eventLocation}/success`);
    }, e => {
      console.log('Unable to Register');
      res.status(500).send('Something broke!');
      res.status(404).send('WTF Not found!');
      res.send(e);
    });    
  }
});

app.post('/registerThai', (req, res) => {
  // res.send(req.body);
  const eachAttendee = req.body.name;
  const attendeeEmail = req.body.email;
  const eventLocation = 'Thailand';
  let numberReg = eachAttendee.length;
  // console.log('Number of Names: ' + numberReg);
  // res.send(eachAttendee);
  if (Array.isArray(eachAttendee)) {
    // Set fields to array
    eachAttendee.forEach(function (item, index) {
      const newRSVP = new AttendeeThai({
        name: item,
        email: req.body.email,
        country: req.body.country[index],
        firstMeeting: req.body.firstMeeting[index],
        personalMeeting: req.body.personalMeeting[index],
        eventCode: eventLocation,
        contactPerson: req.body.email,
        isContactPerson: req.body.name[0]
      });
      newRSVP.save().then(person => {
        // Send out the email
        Emailer({
          email: attendeeEmail,
          to: item, 
          type: 'thai',
          from: 'Thai Event 2018'
        });
        // Redirect to Success page
        res.redirect(`/event/${eventLocation}/success`);
      }, e => {
        console.log('Unable to Register');
        res.status(500).send('Something broke!');
        res.status(404).send('WTF Not found!');
        res.send(e);
      });
    });
  } else {
    const newRSVP = new AttendeeThai({
      name: req.body.name,
      email: req.body.email,
      country: req.body.country,
      firstMeeting: req.body.firstMeeting,
      personalMeeting: req.body.personalMeeting,
      eventCode: eventLocation,
      contactPerson: req.body.email,
      isContactPerson: req.body.name
    });
    newRSVP.save().then(person => {
      // Send out the email
      try {
        Emailer({
          email: attendeeEmail,
          type: 'thai',
          from: 'Thai Oct Event 2018'
        });
      } catch (error) {
        res.status(200).send('email sent! Check Inbox');
        res.status(404).send('WTF Email not set!');
      }
      res.redirect(`/event/${eventLocation}/success`);
    }, e => {
      console.log('Unable to Register');
      res.status(500).send('Something broke!');
      res.status(404).send('WTF Not found!');
      res.send(e);
    });
  }
});


app.get('/login', (req, res) => {
  const fullUrl = proxy + req.get('host');
  res.render('pages/login', {
    title: 'Attendees',
    host: fullUrl
  });
});

app.post('/login', (req, res) => {
  const user = process.env.USERID;
  const pass = process.env.PASSWORD;

  const user2 = process.env.USERID2;
  const pass2 = process.env.PASSWORD2;

  if (req.body.inputUser === user && req.body.inputPassword === pass) {
    req.session.user_id = 'session_user_cookie';
    // res.send('It Works!');
    res.redirect('/users/singapore');
  } else if (req.body.inputUser === user2 && req.body.inputPassword === pass2) {
    req.session.user_id = 'session_user_cookie';
    // res.send('It Works!');
    res.redirect('/users/thailand');
  } else {
    res.send('Bad user/pass');
  }
});

/* View Registrant */
app.get('/users/:event', secureAuth, (req, res) => {
  const fullUrl = proxy + req.get('host');
  let eventLocation = req.params.event;
  let pageRender = "";
  //Check if route is Thailand
  if (eventLocation=="thailand") {
    pageRender = 'pages/users-thailand';
    AttendeeThai.find()
      .sort({
        updated: 'asc',
      })
      .then(item => {
        if (item !== null) {
          console.log(item.length);
          res.render(pageRender, {
            title: 'Thai Attendees',
            location: eventLocation,
            host: fullUrl,
            item
          });
        } else {
          res.redirect('/');
        }
      })
      .catch((error) => {
        res.status(500).send('Internal Server Error');
      });
  } else {
    pageRender = 'pages/users';
    Attendee.find({ eventCode: eventLocation })
      .sort({
        updated: 'asc',
      })
      .then(item => {
        if (item !== null) {
          console.log(item.length);
          res.render(pageRender, {
            title: 'Attendees',
            location: eventLocation,
            host: fullUrl,
            item
          });
        } else {
          res.redirect('/');
        }
      })
      .catch((error) => {
        res.status(500).send('Internal Server Error');
      });
  }


});

app.get('/event/:location/success', (req, res, next) => {
  const fullUrl = proxy + req.get('host');
  const eventLocation = req.params.location;
  let successPage = "";

  if (eventLocation == 'Thailand' || eventLocation == 'thailand') {
    successPage = 'pages/success-thailand';
  } else {
    successPage = 'pages/success';
  }
  res.render(successPage, {
    title: 'Thank You for Registering!',
    host: fullUrl
  });
  
});


/* Exporting an EXCEL file */
app.get('/users/export/:event', secureAuth, (req, res, next) => {
  console.log('Trigger');
  let eventLocation = req.params.event;
  var filename = 'rsvp.csv';
  var dataArray;

  if (eventLocation == "thailand") {
  AttendeeThai.find()
    .lean()
    .exec({}, (err, attendees) => {
      if (err) res.send(err);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
      res.csv(attendees, true);
    });
  } else {
  Attendee.find({ eventCode: eventLocation })
    .lean()
    .exec({}, (err, attendees) => {
      if (err) res.send(err);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
      res.csv(attendees, true);
    });    
  }
});

// Error Management
app.get('/error', (req, res) => {
  const fullUrl = proxy + req.get('host');
  res.render('pages/error', {
    title: 'Error',
    host: fullUrl
  });
});

app.post('/users', (req, res) => {
  
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  user.save().then(() => {
  
  return user.generateAuthToken();

  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.status(500).send(`500 Brave souls error + ${err}`);
});

// Server Port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

module.exports = {app};
