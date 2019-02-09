const request = require('request');
const { parse } = require('node-html-parser');

const call = () => {
  const options = {
    url: 'https://free-proxy-list.net/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  return new Promise((resolve, reject) => {
    request(options, (e, r, b) => {
      if (e) {
        reject(e);
      } else {
        const root = parse(b);
        const result = root.querySelectorAll('#proxylisttable tbody tr').map(row => {
          const ip = row.childNodes[0].childNodes[0].rawText;
          const port = row.childNodes[1].childNodes[0].rawText;
          const brazil = row.childNodes[2].childNodes[0].rawText === 'BR';
          const https = row.childNodes[6].childNodes[0].rawText === 'yes';
          return { host: `${ip}:${port}`, https: https, brazil: brazil };
        });
        resolve(result.filter(r => r.https && r.brazil).map(r => `http://${r.host}`));
      }
    });
  });
}

module.exports =
  class ProxyUrl {
    constructor() {
      this._allUrls = [];
      this._urls = [];
    }

    initialize(cb) {
      (async () => {
        this._allUrls = await call()
        this._urls = this._allUrls.slice(0);
        cb(this);
      })();
    }

    pop() {
      if (this._urls.length === 0) {
        this._urls = this._allUrls.slice(0);
      }

      return this._urls.pop();
    }
  };
