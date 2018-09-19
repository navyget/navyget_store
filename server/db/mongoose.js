import mongoose from 'mongoose';

// set up mongoose to use promises

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/navyget_store_db');

module.exports = { mongoose };
