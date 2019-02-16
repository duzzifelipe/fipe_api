// helper to make asynchronous calls inside a forEach
module.exports.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// returns a array of `parallel` items on each run
// for 3: [1, 2, 3], [4, 5, 6]...
module.exports.asyncForEachMulti = async (array, parallel = 1, callback) => {
  for (let index = 0; index < array.length; index += parallel) {
    await callback(array.slice(index, index + parallel), index, array);
  }
};

// BRL format to float
module.exports.parsePrice = str => {
  return parseFloat(str.replace(/\D+/g, '')) / 100.0;
};

// a delay helper that works with async calls
module.exports.timeOut = delay => {
  return new Promise(resolve => setTimeout(resolve, delay));
};