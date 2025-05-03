let fetchFn;
const { logError } = require('./logUtil');
try {
  fetchFn = global.fetch ? global.fetch : require('cross-fetch');
} catch (e) {
  logError('Erreur lors de la récupération de fetch', e);
  fetchFn = require('cross-fetch');
}

module.exports = { fetchFn }; 