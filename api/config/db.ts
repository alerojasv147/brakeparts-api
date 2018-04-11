const log = require('./logger').log;
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let dbName;
switch (process.env.NODE_ENV) {
  case 'test':
    dbName = 'brakeparts_test';
    break;
  case 'production':
    dbName = 'brakeparts';
    break;
  default:
    dbName = 'brakeparts_dev';
}

// Connect to database
mongoose.connect(`mongodb://${process.env.DB_IP}:27017/${dbName}`);

mongoose.connection.on('error', (err) => {
  if (err.message.indexOf('ECONNREFUSED') !== -1) {
    log.error('Error: The server was not able to reach MongoDB.\nMaybe it is not running?');
    process.exit(1);
  } else {
    throw err;
  }
});
