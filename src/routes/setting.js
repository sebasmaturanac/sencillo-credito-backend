const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const setting = require('../controllers/settingController');

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.use(ensureRole([ROLE.SUPERUSER]));
router.get('/', setting.getAll);
router.put('/', setting.update);

module.exports = router;
