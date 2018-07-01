const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  throw result.error;
}

const session = require('express-session');
const _ = require('lodash');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const csv = require('csv-express');

const {mongoose} = require('./db/mongoose');
const {Attendee} = require('./models/attendee');
const {User} = require('./models/user');

const {authenticate} = require('./middleware/auth.js');

// Power up the Express server
const app = express();
app.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 60000 } }));
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
function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    // res.send('You are not authorized to view this page');
    res.redirect(`/login`);
  } else {
    next();
  }
};

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

app.get('/login', (req, res) => {
  res.send('Login Page');
});

/* View Registrant */
app.get('/users/:event', (req, res) => {
  const fullUrl = proxy + req.get('host');
  let eventLocation = req.params.event;
  Attendee.find({ eventCode: eventLocation })
    .sort({ 
      updated: 'asc', 
    })
    .then(item => {
      if (item !== null) {
        // console.log(item);
        res.render('pages/users', { 
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
});

app.get('/event/:location/success', (req, res, next) => {
  const fullUrl = proxy + req.get('host');
  res.render('pages/success', {
    title: 'Thank You for Registering!',
    host: fullUrl
  });
});


/* Exporting an EXCEL file */
app.get('/users/export/:event', (req, res, next) => {
  console.log('Trigger');
  let eventLocation = req.params.event;
  var filename = 'rsvp.csv';
  var dataArray;
  Attendee.find({ eventCode: eventLocation })
    .lean()
    .exec({}, (err, attendees) => {
      if (err) res.send(err);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
      res.csv(attendees, true);
    });
});

// User Management
app.get('/dashboard', authenticate, (req, res) => {
  res.render('pages/demo');
  // res.send(req.user);
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
