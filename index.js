const async = require('async');
const { parseMakes, parseDescription } = require('./app/Parsers');

// create a async handler for getting the makes and
// after retrieving each car information
async.waterfall([
  cb => {
    parseMakes(cb);
  },
  (makes, cb) => {
    parseDescription(makes, cb);
  }
], (error, result) => {
  console.log(error, result);
});
