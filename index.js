const async = require('async');
const { parseMakes, parseDescription } = require('./app/Parsers');
const ProxyUrl = require('./app/ProxyUrl');

console.log('Starting...');

// create a async handler for getting the makes and
// after retrieving each car information
async.waterfall([
  cb => {
    console.log('... Getting proxy links ...')
    // get a proxy link
    const proxy = new ProxyUrl();
    proxy.initialize(instance => {
      global.proxyInstance = instance;
      console.log(`-> Done with ${instance._urls.length} links`);
      cb(null);
    });
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
  console.log(error || result);
});
