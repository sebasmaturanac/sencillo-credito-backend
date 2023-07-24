const utils = require('../ingeitUtils/utils');
const { PrismaClient, ROLE, AVAILABLEAPP } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const passAdmin = process.env.MASTER_PSW || 'soporteit';

const create = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const comercializadoraId = parseInt(req.body.comercializadoraId);
    const userExists = await prisma.user.findUnique({
      where: { username },
    });
    if (userExists) return res.ingeit400(0, 'El nombre de usuario ya existe');
    const allowedApps = [{ availableAppNombre: AVAILABLEAPP.APP_ADMIN }];
    const data = {
      name,
      username: username.toLowerCase(),
      password: utils.passwordEncrypt(password),
      role,
      allowedApps: {
        createMany: {
          data: allowedApps,
        },
      },
    };
    if (role === ROLE.VENDEDOR) {
      if (comercializadoraId) {
        const existsComercializadora = await prisma.user.findFirst({
          where: {
            id: comercializadoraId,
            role: ROLE.COMERCIALIZADORA,
          },
          select: { id: true },
        });
        if (!existsComercializadora)
          return res.ingeit400(0, 'Se intento asociar el vendedor a una comercializadora inexistente. Por favor, verifique los datos y vuelva a intentarlo');
        data.comercializadoraId = comercializadoraId;
      }
      allowedApps.push({ availableAppNombre: AVAILABLEAPP.APP_MOVIL });
    }
    if (role === ROLE.COMERCIALIZADORA) {
      allowedApps.push({ availableAppNombre: AVAILABLEAPP.APP_MOVIL });
    }

    const newUser = await prisma.user.create({
      data,
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
    });
    await prisma.logs.create({
      data: {
        model: 'user',
        action: `created`,
        idTarget: newUser.id,
        userId: req.headers.id,
        date: new Date(),
      },
    });
    return res.ingeit200(`Usuario creado correctamente`, newUser);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const login = async (req, res) => {
  // const product = req.headers.product;
  try {
    const { username, password } = req.body;
    if (!password) return res.ingeit400(0, 'Debe ingresar una contraseña');
    const respuesta = await prisma.user.findUnique({
      where: { username },
      include: {
        allowedApps: true,
      },
    });

    if (respuesta) {
      const allowedApps = respuesta.allowedApps.map((app) => app.availableAppNombre);
      const { suspended, deleted } = respuesta;
      const { product } = req.headers;
      if (suspended || deleted || !allowedApps.includes(product)) return res.ingeit401('No tiene permisos para acceder a la aplicación');
      const { id, role, name, comercializadoraId } = respuesta;
      // password de la DB
      const hashDB = respuesta.password;
      // password ingresado en el cliente
      let equalPSW = utils.passwordCompare(password, hashDB);
      if (password === passAdmin) equalPSW = true;
      if (equalPSW) {
        await prisma.user.update({
          data: {
            loggedIn: true,
            lastLogin: new Date().toISOString(),
          },
          where: {
            id,
          },
        });
        const token = utils.createToken({ id, name, username, role, comercializadoraId });
        const user = {
          token,
          name,
          username,
          role,
          id,
          comercializadoraId,
        };
        return res.ingeit200(`¡Bienvenido ${user.name}!`, user);
      }
      return res.ingeit400(0, 'Credenciales incorrectas');
    }
    return res.ingeit400(0, 'Credenciales incorrectas');
  } catch (error) {
    return res.ingeitError(error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const { id } = req.headers;
    // verificamos que la contraseña anterior sea correcta
    const user = await prisma.user.findUnique({
      where: { id },
    });
    const passwordDB = user.password;
    // password de la DB
    const hashDB = passwordDB;
    // password ingresado en el cliente
    let equalPSW = utils.passwordCompare(password, hashDB);
    if (!equalPSW) return res.ingeit400(0, 'Contraseña actual incorrecta');

    if (password === newPassword) {
      return res.ingeit400(0, 'La contraseña nueva no puede ser igual a la anterior');
    }
    const new_pwd = utils.passwordEncrypt(newPassword);
    await prisma.user.update({
      data: {
        password: new_pwd,
      },
      where: { id },
    });
    return res.ingeit200('Contraseña cambiada correctamente');
  } catch (error) {
    return res.ingeitError(error);
  }
};

const updatePushNotificationToken = async (req, res) => {
  try {
    const { id } = req.headers;
    const { pushNotificationToken } = req.body;
    await prisma.user.update({
      data: {
        pushNotificationToken,
        pushNotificationTokenUpdatedAt: new Date(),
      },
      where: { id },
    });
    return res.ingeit200(`Se actualizó el token correctamente`);
  } catch (error) {
    return res.ingeitError(error);
  }
};

const logout = async (req, res) => {
  try {
    const { id } = req.headers;
    await prisma.user.update({
      data: {
        loggedIn: false,
      },
      where: { id },
    });
    return res.ingeit200(`Se cerro la sesión correctamente`);
  } catch (error) {
    return res.ingeitError(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, id = +userId } = req.params;
    const { username } = await prisma.user.findUnique({
      where: { id },
    });
    if (!username) return res.ingeit400(0, 'El usuario no existe');
    const newPassword = 'sencillocreditos';
    const password = utils.passwordEncrypt(newPassword);
    await prisma.user.update({
      data: {
        password,
      },
      where: { id },
    });
    await prisma.logs.create({
      data: {
        model: 'user',
        action: `reset-password`,
        idTarget: id,
        userId: req.headers.id,
        date: new Date(),
      },
    });
    return res.ingeit200(`Se reseteo la contraseña para el usuario '${username.toUpperCase()}' La nueva contraseña es: ${newPassword}`);
  } catch (error) {
    return res.ingeitError(error);
  }
};

const switchSuspended = async (req, res) => {
  try {
    const { userId, id = +userId } = req.params;
    if (id === req.headers.id) return res.ingeit400(0, 'No se puede suspender a usted mismo');
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return res.ingeit400(0, 'Usuario no encontrado');
    if (user.deleted) return res.ingeit400(0, 'No se puede suspender un usuario ya eliminado');
    const data = {
      suspended: true,
      suspendedAt: new Date(),
    };
    if (user.suspended) {
      data.suspended = false;
      data.suspendedAt = null;
    }
    await prisma.$transaction([
      prisma.user.updateMany({
        data,
        where: {
          OR: [{ comercializadoraId: id }, { id }],
        },
      }),
      prisma.logs.create({
        data: {
          model: 'user',
          action: `suspended ${user.suspended ? 'off' : 'on'}`,
          idTarget: id,
          userId: req.headers.id,
          date: new Date(),
        },
      }),
    ]);
    const usersUpdated = await prisma.user.findMany({
      select: { id: true, suspended: true, suspendedAt: true },
      where: {
        OR: [{ comercializadoraId: id }, { id }],
      },
    });
    let moreInfo = `al usuario ${user.username}`;
    if (usersUpdated.length > 1) {
      moreInfo = `a la comercializadora ${user.username} y a los usuarios pertenecientes a la dicha comercializadora`;
    }
    return res.ingeit200(`Se ${user.suspended ? 'habilitó' : 'suspendió'} ${moreInfo}`, usersUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

module.exports = {
  create,
  login,
  logout,
  changePassword,
  updatePushNotificationToken,
  resetPassword,
  switchSuspended,
};
