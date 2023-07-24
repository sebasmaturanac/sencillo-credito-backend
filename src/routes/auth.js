const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const auth = require('../controllers/authController');

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.post('/login', auth.login);
router.use(ensureAuthenticated);
router.post('/change-password', auth.changePassword);
router.get('/logout', auth.logout);
router.post('/update-push-notification-token', auth.updatePushNotificationToken);
router.use(ensureRole([ROLE.SUPERUSER, ROLE.AUTORIZADOR]));
router.post('/create', auth.create);
router.patch('/reset-password/:userId', auth.resetPassword);
router.patch('/switch-suspended/:userId', auth.switchSuspended);

module.exports = router;
