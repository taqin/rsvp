const mongoose = require('mongoose');
require('mongoose-type-email');


const RsvpSchema = new mongoose.Schema({
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


const Attendee = mongoose.model('Attendee', RsvpSchema);



module.exports = {Attendee};