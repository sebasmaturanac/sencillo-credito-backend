// Este middleware verifica el token, y si es valido
// en el header me agrega la propiedad idUser para tenerla en todos lados
const { verifyToken } = require('../ingeitUtils/utils');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const checkToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = verifyToken(token);
      // @ts-ignore
      const { id, username, role, name, comercializadoraId } = decoded;
      const { suspended, deleted } = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (suspended || deleted) return res.ingeit401('No tiene permisos para acceder a la aplicación');
      req.headers.id = id;
      req.headers.name = name;
      req.headers.username = username;
      req.headers.role = role;
      req.headers.comercializadoraId = comercializadoraId;
      return next();
    } catch (error) {
      return res.ingeit401(`Token error: ${error.message}`);
    }
  }
  return res.ingeit401('Token error: non-existing token in header');
};

module.exports = checkToken;
