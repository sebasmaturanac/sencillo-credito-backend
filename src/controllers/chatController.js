const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getSocketInstance } = require('../socket/socket');

async function getMessages(req, res) {
  try {
    const { chatId } = req.params; // Necesitarás el ID del chat para buscar los mensajes
    const chat =  await prisma.ChatMessage.findMany({
      where: {
        chatId: Number(chatId),
      },
      include: {
        sender: true, // Incluye detalles del remitente en la respuesta
      },
    });
    getSocketInstance().emit('chats', chat);
    return res.ingeit200('Chats', chat);
  } catch (error) {
    console.error('error chat: ', error);
    return res.ingeitError(error);
  }
}

async function createMessage(req, res) {
  try {
    const {content, chatId, senderId} = req.body; // Necesitarás el ID del chat y del remitente para crear un mensaje

    const chat = await prisma.ChatMessage.create({
      data: {
        content,
        chatId: Number(chatId),
        senderId: Number(senderId),
      },
    });
    getSocketInstance().emit('chats', chat);
    return res.ingeit200('chat enviado', chat);
  } catch (error) {
    console.error('error envio de chat: ', error);
    return res.ingeitError(error);
  }
}

async function createChat(req, res) {
  try {
    const { participant1Id, participant2Id } = req.body;
    const chat = await prisma.Chat.create({
      data: {
        participant1Id: Number(participant1Id),
        participant2Id: Number(participant2Id),
      },
    });
    return res.ingeit200('Chat creado', chat);
  } catch (error) {
    console.error('Error al crear chat: ', error);
    return res.ingeitError(error);
  }
}

module.exports = {
  getMessages,
  createMessage,
  createChat
};
