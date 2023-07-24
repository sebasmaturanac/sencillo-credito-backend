const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const providers = require('../controllers/providersController');
const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.get('/entidades', providers.getEntidades);
router.get('/tipoConsulta', providers.getTipoConsultas);
router.use(ensureRole([ROLE.SUPERUSER]));
router.post('/entidad', providers.createEntidad);
router.patch('/entidad/:entidadId', providers.updateEntidad);
router.delete('/entidad/:entidadId', providers.deleteEntidad);
router.delete('/tipoConsulta/:tipoConsultaId', providers.deleteTipoConsulta);

module.exports = router;
