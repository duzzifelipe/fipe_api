const clip = require('cli-progress');
const { getMakes, getModels, getYears, getDescription } = require('./FipeRequester');
const { asyncForEach, timeOut } = require('./Helpers');
const FileWriter = require('./FileWriter');

// get makes, append to a file
// and return it to the success callback
const parseMakes = cb => {
  (async () => {
    const makes = await getMakes();
    const fw = new FileWriter('makes');

    // open the writter
    fw.open();

    // append headers
    fw.append({ 1: 'make_id', 2: 'make_name' });

    // each element from rest service
    makes.forEach(element => {
      fw.append(element);
    });

    // close writter and callback
    fw.close();
    cb(null, makes);
  })();
};

// from a list of makes, retrieve each step
// make -> models -> years -> description
// and build a file with the complete description
const parseDescription = (makes, cb) => {
  (async () => {
    // write csv file
    const fw = new FileWriter('models');

    // open the writter
    fw.open();

    // headers
    fw.append({
      1: 'make_id',
      2: 'make_name',
      3: 'model_id',
      4: 'model_name',
      5: 'year',
      6: 'fuel_id',
      7: 'fuel_code',
      8: 'fuel_name',
      9: 'fipe_code',
      10: 'vehicle_type',
      11: 'price'
    });

    // setup CLI loader
    const cliBar = new clip.Bar({}, clip.Presets.legacy);
    cliBar.start(makes.length, 0);
    let counter = 0;

    // loop over makes
    await asyncForEach(makes, async make => {
      const models = await getModels(make.id);
      // loop over models
      await asyncForEach(models, async model => {
        const years = await getYears(model.makeId, model.id);
        // loop over years
        await asyncForEach(years, async year => {
          const description = await getDescription(year.makeId, year.modelId, year.year, year.fuel);
          // put description on file
          fw.append(description);
        });

        // set some delay between each model action
        await timeOut(2000);
      });

      // update the bar
      counter++;
      cliBar.update(counter);
      await timeOut(30000);
    });

    // finalize it
    cliBar.stop();
    fw.close();
    cb(null, 'FINISHED!');
  })();
};

module.exports = {
  parseMakes,
  parseDescription
};