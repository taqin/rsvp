require('./config/config');

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
const port = process.env.PORT;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define the Routes
/* GET home page. */
app.get('/', (req, res, next) => {
  res.render('pages/index', { title: 'Welcome' });
});

/* POST Registration Details */
app.post('/register/:location', (req, res) => {
  const eachAttendee = req.body.name;
  const eventLocation = req.params.location;
  let numberReg = eachAttendee.length;
  // console.log('Number of Names: ' + numberReg);
  // res.send(eachAttendee);
  if (Array.isArray(eachAttendee)) {
    eachAttendee.forEach(function(item, index) {
        const newRSVP = new Attendee({
          name: item,
          email: req.body.email,
          country: req.body.country,
          firstMeeting: req.body.firstMeeting[index],
          personalMeeting: req.body.personalMeeting[index],
          eventCode: eventLocation,
          firstEvent: req.body.firstEvent[index],
          secondEvent: req.body.secondEvent[index],
          contactPerson: req.body.email,
          isContactPerson: req.body.name[0],
        });
        newRSVP.save().then(person => {
        // console.log('Registered', req.body.name);
        res.send('Success!');
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
      res.send('Success!');
    }, e => {
      console.log('Unable to Register');
      res.status(500).send('Something broke!');
      res.status(404).send('WTF Not found!');
      res.send(e);
    });    
  }
});

/* View Registrant */
app.get('/users/:event', (req, res) => {
  let eventLocation = req.params.event;
  Attendee.find({ eventCode: eventLocation })
    .sort({ 
      updated: 'asc', 
    })
    .then(item => {
      if (item !== null) {
        // console.log(item);
        res.render('pages/users', { 
          title: 'Attendees: ' + eventLocation,
          location: eventLocation,
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

/* Exporting an EXCEL file */
app.get('/export', (req, res, next) => {
  var filename = "rsvp.csv";
  var dataArray;
  Attendee.find().lean().exec({}, (err, attendees) => {
    if (err) res.send(err);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader("Content-Disposition", 'attachment; filename=' + filename);
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
  res.status(500).send('500 Brave souls error');
});

// Server Port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

module.exports = {app};
