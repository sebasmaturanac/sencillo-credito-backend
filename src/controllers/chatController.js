const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getSocketInstance } = require('../socket/socket');

async function getMessages(req, res) {
  try {
    const chat =  await prisma.ChatMessage.findMany();
    getSocketInstance().emit('chats', chat);
    return res.ingeit200('Chats', chat);
  } catch (error) {
    console.error('error chat: ', error);
    return res.ingeitError(error);
  }
}

async function createMessage(req, res) {
  try {
    const {content} = req.body
    const chat = await prisma.ChatMessage.create({
      data: {
        content,
      },
    });
    getSocketInstance().emit('chats', chat);
    return res.ingeit200('chat enviado', chat);
  } catch (error) {
    console.error('error envio de chat: ', error);
    return res.ingeitError(error);
  }
}

module.exports = {
  getMessages,
  createMessage,
};
