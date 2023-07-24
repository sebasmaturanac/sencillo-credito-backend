const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const pedido = require('../controllers/pedidoController');
const ensureRole = require('../middlewares/ensureRole');

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
// const ensureAutorizador = require('../middlewares/ensureAutorizador');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */

router.get('/', pedido.dispatchGetPedidos);
router.get('/id/:pedidoId', pedido.getPedido);
router.get('/search', pedido.searchPedido);
router.post('/', ensureRole([ROLE.VENDEDOR, ROLE.COMERCIALIZADORA]), pedido.create);
router.get('/estadoCuenta', ensureRole([ROLE.VENDEDOR, ROLE.COMERCIALIZADORA]), pedido.estadoCuenta);
router.get('/attachment/:pedidoId', pedido.getAttachments);
router.post('/pendienteMargenOk', pedido.pendienteMargenOk); // sirve para aprobar o rechazar el pedido. al cambiar estado de un pedido, primero se tiene q corroborar que el pedido este en revision por la persona que quiere cambiar el estado, y al cambiar el estado, ya no esta mas en revision por lo tanto hay q disparar socket
router.use(ensureRole([ROLE.SUPERUSER, ROLE.AUTORIZADOR]));
router.put('/switchRevision', pedido.switchRevision); // cambia el estado de PENDIENTE a EN REVISION y VISCEVERSA, solo sirve para poner en revision, y si el autorizador se arrepiente y cancela la revision, vuelve a pendiente, pero si un estado se pasa a pendiente, y despues se lo aprueba o rechaza, hay que llamar al endpoint de abajo CambiarEstado. Un pedido aprobado o rechazado no puede ejecutar este endpoint.
router.post('/cambiarEstado', pedido.cambiarEstado); // sirve para aprobar o rechazar el pedido. al cambiar estado de un pedido, primero se tiene q corroborar que el pedido este en revision por la persona que quiere cambiar el estado, y al cambiar el estado, ya no esta mas en revision por lo tanto hay q disparar socket
router.post('/cambiarMontoSolicitado', pedido.cambiarMontoSolicitado); // sirve para aprobar o rechazar el pedido. al cambiar estado de un pedido, primero se tiene q corroborar que el pedido este en revision por la persona que quiere cambiar el estado, y al cambiar el estado, ya no esta mas en revision por lo tanto hay q disparar socket
router.patch('/comision/:comisionId/setPagada', pedido.setComisionPagada);
router.get('/comision/user/:userId', pedido.getComisionesByUserId);
router.post('/comision/setPagadas', pedido.setComisionesPagadas);
router.post('/regalia/setPagada', pedido.setRegaliaPagada);
router.use(ensureRole([ROLE.SUPERUSER]));
router.delete('/oldAttachments', pedido.deleteOldAttachments); // sirve para aprobar o rechazar el pedido. al cambiar estado de un pedido, primero se tiene q corroborar que el pedido este en revision por la persona que quiere cambiar el estado, y al cambiar el estado, ya no esta mas en revision por lo tanto hay q disparar socket
router.get('/exportarExcel', pedido.exportarExcel);

module.exports = router;
