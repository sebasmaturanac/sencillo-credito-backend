const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();
const message = require('../controllers/messageController');

/* ------------ IMPORTACION PARA USO MIDDLEWARE AUTH ------------ */
// const ensureRole = require('../middlewares/ensureRole');

/* ------------ DESPACHADOR DE RUTAS ---------------------------- */
router.post('/', message.newMessage);
router.patch('/mark-read', message.markRead);
router.get('/', message.getMessages);
router.get('/conversationThread/:conversationThread', message.getConversationThread);
router.get('/:messageId', message.getMessage);

module.exports = router;
