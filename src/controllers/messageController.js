const { PrismaClient, ROLE } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});
const { nanoid } = require('nanoid');
const { sendPushNotification } = require('./oneSignalController');

const getMessages = async (req, res) => {
  try {
    const messages = await prisma.usersHasMessages.findMany({
      select: {
        message: {
          select: {
            id: true,
            title: true,
            body: true,
            createdAt: true,
          },
        },
        conversationThread: true,
        isReaded: true,
        senderUser: {
          select: {
            name: true,
            id: true
          },
        },
      },
      where: {
        destinationUserId: req.headers.id,
      },
      orderBy: {
        message: {
          createdAt: 'desc',
        },
      },
    });
    return res.ingeit200('Messages', messages);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const getMessage = async (req, res) => {
  try {
    const { messageId, id = +messageId } = req.params;
    const message = await prisma.usersHasMessages.findFirst({
      select: {
        message: {
          select: {
            id: true,
            title: true,
            body: true,
            createdAt: true,
          },
        },
        conversationThread: true,
        isReaded: true,
        senderUser: {
          select: {
            name: true,
          },
        },
      },
      where: {
        messageId: id,
      },
    });
    return res.ingeit200('Message', message);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const getConversationThread = async (req, res) => {
  try {
    const { conversationThread } = req.params;
    const messages = await prisma.usersHasMessages.findMany({
      select: {
        message: {
          select: {
            id: true,
            title: true,
            body: true,
            createdAt: true,
          },
        },
        conversationThread: true,
        isReaded: true,
        senderUser: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      where: {
        conversationThread,
      },
    });
    return res.ingeit200('Messages', messages);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const newMessage = async (req, res) => {
  try {
    const { title, body, destinationIds } = req.body;
    let { conversationThread } = req.body;
    const userRole = req.headers.role;
    const senderUserId = req.headers.id;
    if (userRole === ROLE.COMERCIALIZADORA || userRole === ROLE.VENDEDOR) {
      if (!conversationThread) return res.ingeit401('El usuario no tiene permisos para enviar un nuevo mensaje');
      if (destinationIds.length !== 1) return res.ingeit401('Una respuesta solo puede ser enviada a un solo usuario');
      const userHasThread = await prisma.usersHasMessages.findFirst({
        where: {
          AND: [{ conversationThread }, { destinationUserId: senderUserId }],
        },
      });
      if (!userHasThread) return res.ingeit401('No se encontro la conversación para enviar la respuesta');
    }
    const existsUsers = await prisma.user.findMany({
      where: {
        id: {
          in: destinationIds,
        },
      },
    });
    if (existsUsers.length !== destinationIds.length) return res.ingeit400(0, 'No se pudo enviar el mensaje. Corrobore los destinatarios ');
    const messagesToUsers = destinationIds.map((id) => {
      return {
        senderUserId,
        destinationUserId: id,
        conversationThread: conversationThread || nanoid(),
      };
    });
    const newMessage = await prisma.message.create({
      data: {
        title,
        body,
        users: {
          createMany: {
            data: messagesToUsers,
          },
        },
      },
    });
    const users = await prisma.user.findMany({
      select: {
        pushNotificationToken: true,
      },
      where: {
        id: {
          in: destinationIds,
        },
      },
    });
    const usersTokens = users.map((user) => user.pushNotificationToken);
    sendPushNotification({
      title,
      body,
      tokens: usersTokens,
    });
    return res.ingeit200('Mensaje enviado correctamente', newMessage);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const markRead = async (req, res) => {
  try {
    const { senderUserId, messageId } = req.body;
    const where = {
      messageId: +messageId,
      destinationUserId: req.headers.id,
      senderUserId: +senderUserId,
    };
    const existsMessage = await prisma.usersHasMessages.findUnique({
      where: {
        messageId_senderUserId_destinationUserId: where,
      },
    });
    if (!existsMessage) return res.ingeit400(0, 'No se encontro el mensaje para marcar como leído');
    const message = await prisma.usersHasMessages.update({
      data: {
        isReaded: true,
        readedAt: new Date(),
      },
      where: {
        messageId_senderUserId_destinationUserId: {
          messageId: +messageId,
          destinationUserId: req.headers.id,
          senderUserId: +senderUserId,
        },
      },
    });
    return res.ingeit200('OK', message);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

module.exports = {
  newMessage,
  markRead,
  getMessages,
  getMessage,
  getConversationThread,
};
