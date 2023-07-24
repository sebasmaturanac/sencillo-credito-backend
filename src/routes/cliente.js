const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const cliente = require('../controllers/clienteController');

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.post('/', cliente.create);
router.get('/id/:clienteId', cliente.getClienteById);
router.get('/search/:search', cliente.searchCliente);
router.get('/dni/:dni', cliente.searchClienteByDni);
router.use(ensureRole([ROLE.SUPERUSER, ROLE.AUTORIZADOR]));
router.post('/switchAllowNewPedido', cliente.switchAllowNewPedido);

module.exports = router;
