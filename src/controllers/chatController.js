const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const prisma = new PrismaClient();
const { getSocketInstance } = require('../socket/socket');
const { s3Client, uploadParams } = require('../config/s3.config');
const imageThumbnail = require('image-thumbnail');
const env = require('../config/s3.env');

const MB = 1000000;
const multerInstanceChat = (name) => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: {
      fieldSize: 5 * MB,
      fileSize: 5 * MB,
    },
  });

  return upload.single(name);
};

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
    const { content, chatId, senderId} = req.body; // Añade 'file' aquí
    const imagen = req.file

    // Sube la imagen a S3
    const target = Date.now().toString();
    const mimetype = 'image/jpg';
    const options = { height: 1080, responseType: 'buffer', fit: 'inside' };
    const base64 = await imageThumbnail(imagen.buffer, options);
    const Key = `sencillobucket/${'sencillo_creditos'}-chatId_${chatId}-target_${target}.jpg`;
    const imageUrl = `https://${env.Bucket}.s3.${env.REGION}.amazonaws.com/${Key}`;
    const params = { 
      ...uploadParams,
       Key,
       Body: base64,
       ContentType: mimetype, // Asegúrate de que esté configurado correctamente para tu imagen
       ContentDisposition: 'inline' };
    s3Client.upload(params, async (err) => {
      if (err) return res.ingeitError(err);

      // Crea el mensaje en la base de datos
      const chat = await prisma.ChatMessage.create({
        data: {
          content,
          chatId: Number(chatId),
          senderId: Number(senderId),
          resourceLink: imageUrl, // Guarda la URL de la imagen aquí
        },
      });

      getSocketInstance().emit('chats', chat);
      return res.ingeit200('chat enviado', chat);
    });
  } catch (error) {
    console.error('error envio de chat: ', error);
    return res.ingeitError(error);
  }
}


async function createChat(req, res) {
  try {
    const { participant1Id, participant2Id } = req.body;

    // Comprueba si el chat ya existe
    const existingChat = await prisma.Chat.findFirst({
      where: {
        AND: [
          { participant1Id: Number(participant1Id) },
          { participant2Id: Number(participant2Id) },
        ],
      },
    });

    if (existingChat) {
      // Si el chat ya existe, devuelve una respuesta indicando que ya existe
      return res.ingeit200('Chat ya existe', existingChat);
    } else {
      // Si el chat no existe, crea el chat
      const chat = await prisma.Chat.create({
        data: {
          participant1Id: Number(participant1Id),
          participant2Id: Number(participant2Id),
        },
      });
      return res.ingeit200('Chat creado', chat);
    }
  } catch (error) {
    console.error('Error al crear chat: ', error);
    return res.ingeitError(error);
  }
}

module.exports = {
  getMessages,
  createMessage,
  createChat,
  multerInstanceChat
};
