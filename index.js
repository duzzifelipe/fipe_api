const async = require('async');
const TorAgent = require('toragent');
const { parseMakes, parseDescription } = require('./app/Parsers');
const FileWriter = require('./app/FileWriter');

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
        cb(null);
      });
    }
  },
  (cb) => {
    console.log('... Opening File Writers ...');
    global.fwMakes = new FileWriter('makes');
    global.fwModels = new FileWriter('models');
    cb(null);
  },
  (cb) => {
    console.log('... Getting makes ...');
    parseMakes(cb);
  },
  (makes, cb) => {
    console.log('... Starting Car\'s Description ...');

    if (process.env.LIMIT_BT && process.env.LIMIT_TP) {
      const bt = parseInt(process.env.LIMIT_BT);
      const tp = parseInt(process.env.LIMIT_TP);
      console.log(`... From make ${bt} to ${tp} ...`);
      parseDescription(makes.slice(bt, tp), cb);

    } else {
      parseDescription(makes, cb);
    }
  }
], (error, result) => {
  console.log(error || result, ` at ${Date.now()}`);
});

process.on('SIGINT', () => {
  console.log('RECEIVED CLOSE SIGNAL');
  try {
    global.fwMakes.close();
    global.fwModels.close();
  } catch (e) {

  }
  console.log('FILES CLOSED');
  process.exit();
});
