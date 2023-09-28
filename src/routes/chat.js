// const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();

const chat = require('../controllers/chatController')

router.get('/getUserByVendedor/', chat.getUserByVendedor);
router.get('/getUserComercializadora/:id', chat.getUserComercializadora);
router.get('/messages/:chatId', chat.getMessages);
router.post('/messages',chat.multerInstanceChat("file"),chat.createMessage)
router.post('/createchat', chat.createChat)

module.exports = router;