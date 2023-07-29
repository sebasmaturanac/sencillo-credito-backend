// const { ROLE } = require('@prisma/client');
const express = require('express');

const router = express.Router();

const chat = require('../controllers/chatController')

router.get('/messages',chat.getMessages)
router.post('/messages',chat.createMessage)

module.exports = router;