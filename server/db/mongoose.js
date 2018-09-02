const mongoose = require('mongoose');

// set up mongoose to use promises

mongoose.Promise = global.promise;
mongoose.connect('mongodb://localhost:27017/navyget_store_db');

module.exports = { mongoose };
