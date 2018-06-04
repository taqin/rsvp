const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const csv = require('csv-express');

require('mongoose-type-email');

// Connect to the Database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/rsvp');

// Define the  Schemas
const eventSchema = mongoose.Schema({
  name: String,
  date: Date,
});
const rsvpSchema = mongoose.Schema({
  // Do Data validation and default value
  updated: { type: Date, default: Date.now },
  name: { type: String, default: 'Nameless' },
  email: mongoose.SchemaTypes.Email,
  country: String,
  firstMeeting: { type: String, default: 'No' },
  personalMeeting: { type: String, default: 'No' },
  eventCode: String,
  firstEvent: { type: String, default: 'No' },
  secondEvent: { type: String, default: 'No' },
  isContactPerson: String,
  contactPerson: String,
  rsvpCode: String
});

// Define the Models
// const Malaysia = mongoose.model('Malaysia', rsvpSchema);
// const Indonesia = mongoose.model('Indonesia', rsvpSchema);
const Attendee = mongoose.model('Attendee', rsvpSchema);

// Power up the Express server
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

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

app.get('/demo', (req, res) => {
  res.render('pages/demo');
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
app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

module.exports = app;
