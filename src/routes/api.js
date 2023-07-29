const express = require('express');
const router = express.Router();
const IngeitResponse = require('../ingeitUtils/response');

// sirve para hacer res.inget() para responder al frontend, o en caso de catch, res.ingeitError()
IngeitResponse(router);

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
const ensureVersion = require('../middlewares/ensureVersion');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

/* ------------ IMPORTACION DE RUTAS ---------------------------- */
const auth = require('./auth');
const user = require('./user');
const cliente = require('./cliente');
const pedido = require('./pedido');
const providers = require('./providers');
const estadistica = require('./estadistica');
const uploads = require('./uploads');
const setting = require('./setting');
const message = require('./message');
const chat = require('./chat')

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.get('/test', (_req, res) => {
  res.json('SERVER OK');
});
router.use(ensureVersion);
router.use('/auth', auth);
router.use(ensureAuthenticated);
router.use('/user', user);
router.use('/cliente', cliente);
router.use('/pedido', pedido);
router.use('/providers', providers);
router.use('/estadistica', estadistica);
router.use('/uploads', uploads);
router.use('/setting', setting);
router.use('/message', message);
router.use('/chat', chat);

module.exports = router;
