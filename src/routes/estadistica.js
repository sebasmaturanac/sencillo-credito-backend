const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const estadistica = require('../controllers/estadisticaController');
const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
// router.use(ensureRole([ROLE.SUPERUSER]));
router.get('/', estadistica.getEstadisticas);

module.exports = router;
