const { getMakes, getModels, getYears, getDescription } = require('./FipeRequester');
const { asyncForEach } = require('./Helpers');

// get makes, append to a file
// and return it to the success callback
const parseMakes = cb => {
  (async () => {
    const makes = await getMakes();
    const fw = global.fwMakes;

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
    const fw = global.fwModels;

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

    // makes count
    let counter = 1;

    // loop over makes
    await asyncForEach(makes, async make => {
      console.log(`--> [${counter}/${makes.length}] Loading models for make: ${make.name}`);

      const models = await getModels(make.id);
      let modelCount = 1;
      // loop over models
      await asyncForEach(models, async model => {
        console.log(`    -> [${modelCount}/${models.length}] Getting years for model ${model.name}`);
        const years = await getYears(model.makeId, model.id);
        let yearCount = 1;
        // loop over years
        await asyncForEach(years, async year => {
          console.log(`      -> [${yearCount}/${years.length}] Getting description for year ${year.year}`)
          const description = await getDescription(year.makeId, year.modelId, year.year, year.fuel);
          // put description on file
          fw.append(description);
          yearCount++;
        });

        // set some delay between each model action
        modelCount++;
      });

      // update the bar
      counter++;
    });

    // finalize it
    fw.close();
    cb(null, 'FINISHED!');
  })();
};

module.exports = {
  parseMakes,
  parseDescription
};