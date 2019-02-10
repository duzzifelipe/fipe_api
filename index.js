const async = require('async');
const { parseMakes, parseDescription } = require('./app/Parsers');
const TorAgent = require('toragent');

console.log(`Starting at [${Date.now()}]...`);

// create a async handler for getting the makes and
// after retrieving each car information
async.waterfall([
  (cb) => {
    if (process.env.DISABLE_TOR) {
      console.log('... Skipping Tor config ...');
      cb(null);

    } else {
      console.log('... Setting up Tor link ...');
      TorAgent.create().then(agent => {
        global.agent = agent;
        console.log('Done!');
        cb(null);
      });
    }
  },
  (cb) => {
    console.log('... Getting makes ...');
    parseMakes(cb);
  },
  (makes, cb) => {
    console.log('... Starting Car\'s Description ...');
    parseDescription(makes, cb);
  }
], (error, result) => {
  console.log(error || result, ` at ${Date.now()}`);
});
