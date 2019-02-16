/**
 * 
 * 
 * 
 * 
 * 
 * 
 * REMOVE THAT PROGRESS AND JUST LOG A LINE WITH THE CONTENT
 * "GETTING CAR 1"
 * "GETTING MAKE 1"
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
const request = require('request');
const qs = require('querystring');
const { parsePrice } = require('./Helpers');

const requesterCall = (options, callStack, cb) => {
  request(options, (e, r, b) => {
    if (e) {
      if (callStack <= 5 && !process.env.DISABLE_TOR) {
        console.log(`Call stack is: ${callStack}/5, resetting Tor IP`);
        // options.agent holds a tor instance
        options.agent.rotateAddress()
          .then(_ => {
            console.log('Calling again with new Tor IP');
            requesterCall(options, callStack + 1, cb);
          })
          .catch(e => cb(e));
      
      } else {
        console.log('So much errors, finishing this stack...');
        console.log(options);
        cb(e);
      }

    } else {
      cb(null, JSON.parse(b));
    }
  });
};

const requester = (path, body) => {
  return new Promise((resolve, reject) => {
    (async () => {
      // configure current request
      const options = {
        url: `https://veiculos.fipe.org.br/api/veiculos/${path}`,
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Referer': 'https://veiculos.fipe.org.br/',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        agent: process.env.DISABLE_TOR ? undefined : global.agent,
        body: qs.stringify(body)
      };

      // send the request
      requesterCall(options, 1, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    })();
  });
};

module.exports.getMakes = async () => {
  const body = {
    codigoTipoVeiculo: 1,
    codigoTabelaReferencia: 238
  };

  const result = await requester('/ConsultarMarcas', body);
  return result.map(item => ({ id: parseInt(item.Value), name: item.Label }));
};

module.exports.getModels = async (makeId) => {
  const body = {
    codigoTipoVeiculo: 1,
    codigoTabelaReferencia: 238,
    codigoMarca: makeId,
    ano: null,
    codigoTipoCombustivel: null,
    anoModelo: null,
    modeloCodigoExterno: null
  };

  const result = await requester('/ConsultarModelos', body);
  return result.Modelos.map(item => ({
    makeId: makeId,
    id: parseInt(item.Value),
    name: item.Label
  }));
};

module.exports.getYears = async (makeId, modelId) => {
  const body = {
    codigoTipoVeiculo: 1,
    codigoTabelaReferencia: 238,
    codigoMarca: makeId,
    codigoModelo: modelId,
    ano: null,
    codigoTipoCombustivel: null,
    anoModelo: null,
    modeloCodigoExterno: null
  };

  const result = await requester('/ConsultarAnoModelo', body);
  return result.map(item => {
    const values = item.Value.split('-').map(v => parseInt(v));
    return {
      makeId: makeId,
      modelId: modelId,
      year: values[0],
      fuel: values[1],
      code: item.Value,
      name: item.Label
    };
  });
};

module.exports.getDescription = async (makeId, modelId, year, fuelId) => {
  const body = {
    codigoTipoVeiculo: 1,
    codigoTabelaReferencia: 238,
    codigoMarca: makeId,
    codigoModelo: modelId,
    anoModelo: year,
    codigoTipoCombustivel: fuelId,
    tipoVeiculo: null,
    modeloCodigoExterno: null,
    tipoConsulta: 'tradicional'
  };

  const result = await requester('/ConsultarValorComTodosParametros', body);
  return {
    makeId: makeId,
    makeName: result.Marca,
    modelId: modelId,
    modelName: result.Modelo,
    year: year,
    fuelId: fuelId,
    fuelCode: result.SiglaCombustivel,
    fuelName: result.Combustivel,
    fipeCode: result.CodigoFipe,
    vehicleType: result.TipoVeiculo,
    price: parsePrice(result.Valor),
  };
};
