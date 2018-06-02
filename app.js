const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

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
  firstMeeting: { type: Boolean, default: false },
  personalMeeting: { type: Boolean, default: false },
  eventCode: String,
  firstEvent: { type: Boolean, default: false },
  secondEvent: { type: Boolean, default: false },
  isContactPerson: Boolean,
  contactPerson: String,
  rsvpCode: String
});

// Define the Models
const Malaysia = mongoose.model('Malaysia', rsvpSchema);
const Indonesia = mongoose.model('Indonesia', rsvpSchema);
const Singapore = mongoose.model('Singapore', rsvpSchema);

// Power up the Express server
const app = express();
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// Define the Routes
/* GET home page. */
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Expressing' });
});
/* POST Registration Details */
app.post('/register', function (req, res, next) {

  const eachAttendee = [req.body.name];
  const eventLocation = req.body.event;

  console.log(eventLocation);
  console.log(req.body);

  eachAttendee.forEach(function (item) {
    const newRSVP = new Singapore({
      name: req.body.name,
      email: req.body.email,
      country: req.body.country,
      firstMeeting: req.body.firstMeeting,
      personalMeeting: req.body.secondMeeting,
      // eventCode: req.body.eventCode,
      firstEvent: req.body.firstEvent,
      secondEvent: req.body.secondEvent
      // isContactPerson: req.body.isContactPerson,
      // contactPerson: req.body.contactPerson,
      // rsvpCode: req.body.rsvpCode
    });
    newRSVP.save().then(person => {
        console.log('Registered', person);
        res.send(person);
      }, e => {
        console.log('Unable to Register');
        res.status(500).send('Something broke!');
        res.status(404).send('WTF Not found!');
        res.send(e);
      });
  });
});
/* View Registrant */
app.get('/users', function (req, res, next) {
  Singapore.find().then(item => {
    if (item !== null) {
      console.log(item);
      res.render('users', 
      { 
        title: 'Attendees',
        item,
      });
    } else {
      res.redirect('/');
    }
  }).catch(function (error) {
    res.status(500).send('Internal Server Error');
  });

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.status(500).send('500 Brave souls error');
});

// Server Port
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

module.exports = app;
