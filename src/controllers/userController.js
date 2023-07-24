const { PrismaClient, ROLE } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const getAllUsers = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        suspended: true,
        suspendedAt: true,
        createdAt: true,
        comercializadora: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        username: 'asc',
      },
    });
    return res.ingeit200(`Usuarios`, users);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const getComercializadora = async (req, res) => {
  try {
    const { userId, id = +userId } = req.params;
    if (!id) return res.ingeit400(0, `Debe ingresar un ID válido`);
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        suspended: true,
        vendedoresComercializadora: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            suspended: true,
          },
        },
      },
      where: {
        id,
      },
    });
    if (user.role !== ROLE.COMERCIALIZADORA) return res.ingeit400(0, `El ID ingresado no pertenece a una comercializadora`);
    return res.ingeit200(`Comercializadora`, user);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const getComercializadoras = async (_req, res) => {
  try {
    const comercializadoras = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        suspended: true,
        vendedoresComercializadora: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            suspended: true,
          },
        },
      },
      where: {
        role: ROLE.COMERCIALIZADORA,
      },
    });
    return res.ingeit200(`Comercializadoras`, comercializadoras);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, id = +userId } = req.params;
    const { name } = req.body;
    const userUpdated = await prisma.user.update({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        suspended: true,
        suspendedAt: true,
        createdAt: true,
        comercializadora: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
      where: {
        id,
      },
    });
    await prisma.logs.create({
      data: {
        model: 'user',
        action: `update`,
        idTarget: id,
        userId: req.headers.id,
        date: new Date(),
      },
    });
    return res.ingeit200(`Usuario actualizado exitosamente`, userUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

module.exports = {
  getAllUsers,
  getComercializadora,
  getComercializadoras,
  updateUser,
};
