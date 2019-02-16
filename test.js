const fs = require('fs');

fs.writeFileSync('./output/x.txt', `${process.env.LIMIT_BT}_${process.env.LIMIT_TP}`);