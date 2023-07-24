const version = require('../config/version');
/* FORMATO VERSIONADO HEADER EN CLIENTE
version = { product: 'x', release: x.y.z}
POSTMAN EJEMPLO: HEADER KEY Version VALUE {"product":"appMovil","release":"1.0.0"}
*/

const checkNeedUpdate = (req, res, next) => {
  // control de version
  // traemos la version del cliente
  const versionClient = req.headers.version;
  if (versionClient) {
    try {
      const { product } = JSON.parse(versionClient);
      const productRelease = parseInt(JSON.parse(versionClient).release.replace(/\./g, ''));
      // traemos la version del backend
      const minRelease = parseInt(version[product].minRelease.replace(/\./g, ''));
      const release = parseInt(version[product].release.replace(/\./g, ''));
      const { logout } = version[product];
      // comparamos que cliente este dentro de min and release
      let needUpdate = true;
      if (productRelease >= minRelease && productRelease <= release) needUpdate = false;
      if (needUpdate) {
        return res.ingeit403('Update version needed', logout);
      }
      req.headers.product = product;
      return next();
    } catch (error) {
      return res.ingeit403('Version error: wrong formated', false);
    }
  }
  return res.ingeit403('Version error: non-existing version in header');
};

module.exports = checkNeedUpdate;
