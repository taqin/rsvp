const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expressing' });
});
/* POST Registration Details */
router.post('/register', function (req, res, next) {

  const newRSVP = new Attendee({
    name: req.body.name,
    email: req.body.email,
    country: req.body.country,
    firstMeeting: req.body.firstMeeting,
    personalMeeting: req.body.personalMeeting,
    eventCode: req.body.eventCode,
    firstEvent: req.body.firstEvent,
    secondEvent: req.body.secondEvent,
    isContactPerson: req.body.isContactPerson,
    contactPerson: req.body.contactPerson,
    rsvpCode: req.body.rsvpCode,
  });
  newRSVP.save().then((person) => {
    console.log('Registered', person);
  }, (e) => {
    console.log('Unable to Register')
  });
  
});

module.exports = router;
