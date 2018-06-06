var mongoose = require('mongoose');

// Connect to the Database
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = { mongoose };
