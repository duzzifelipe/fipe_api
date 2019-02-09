const request = require('request');
const qs = require('querystring')

const requester = (path, body) => {
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
    body: qs.stringify(body)
  };

  return new Promise((resolve, reject) => {
    request(options, (e, r, b) => {
      if (e) {
        reject(e);
      } else {
        resolve(JSON.parse(b));
      }
    });
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

module.exports.getModels = async (makeId, cb) => {
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

module.exports.getYears = async (makeId, modelId, cb) => {
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

module.exports.getDescription = async (makeId, modelId, year, fuelId, cb) => {
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

const parsePrice = str => {
  return parseFloat(str.replace(/\D+/g, '')) / 100.0;
};