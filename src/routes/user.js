const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const user = require('../controllers/userController');

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.use(ensureRole([ROLE.SUPERUSER, ROLE.AUTORIZADOR]));
router.get('/', user.getAllUsers);
router.get('/comercializadora', user.getComercializadoras);
router.get('/comercializadora/:userId', user.getComercializadora);
router.patch('/:userId', user.updateUser);

module.exports = router;
