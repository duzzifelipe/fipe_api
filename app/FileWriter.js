const fs = require('fs');
const csv = require('csv-stringify');

module.exports =
class FileWriter {
  constructor(fileName) {
    this._fileName = fileName;
  }

  open() {
    // creates a new file or truncate the existent
    const prefix = process.env.LIMIT_BT && process.env.LIMIT_TP ?
      `${process.env.LIMIT_BT}_${process.env.LIMIT_TP}_` : '';
    this._fd = fs.openSync(`./output/${prefix}${this._fileName}.csv`, 'w');
  }

  append(row) {
    let line = '';
    const values = Object.values(row);

    // append each value to the line string
    // using a comma to separate
    values.forEach(val => {
      line += `,${val}`;
    });

    // remove first comma (appended by the first item)
    // and add the line separator (\n)
    line = line.slice(1);
    line += '\n';

    // append to the file
    fs.writeSync(this._fd, line);
  }

  close() {
    // close the file writer
    fs.closeSync(this._fd);
  }
}