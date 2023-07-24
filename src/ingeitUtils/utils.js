// aqui van los metodos utilizados como ser Transoformar fechas, y cosas asi q se puedan utilizar
// en varios lados como por ej tb Primera Letra Mayuscula
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { s3Client, uploadParams } = require('../config/s3.config.js');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  errorFormat: "minimal",
})
const _SECRET_KEY = process.env.SECRET_KEY || 'xljcWzXGriTN8hkfUdv2xrjzCBNvq0Yk';
const MINUTE = 60;
const EXPIRE_MINUTES = 30 * MINUTE;

const getSignedUrl = (Key) => s3Client.getSignedUrl('getObject', {
  Bucket: 'mutualcongreso',
  Key,
  Expires: EXPIRE_MINUTES,
});

const passwordEncrypt = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const passwordCompare = (userPassword, hashDB) => bcrypt.compareSync(userPassword, hashDB);

const createToken = (payload) => {
  // const expires = { expiresIn: '1d' }; // 1 dia
  return jwt.sign(payload, _SECRET_KEY); // con expire
};

const verifyToken = (token) => jwt.verify(token, _SECRET_KEY);

const createTokenTest = (idUser) => {
  const payload = {
    idUser,
  };
  const expires = { expiresIn: '1h' }; // 1 hora
  // let expires = { expiresIn: 10 } // 10 segundos, es directamente number los segundos, no string,
  // o puede ser '10s' en string let expires = { expiresIn: 1 * 60 } // 60 segundos, 1 minuto
  return jwt.sign(payload, _SECRET_KEY, expires); // con expire
};

const getDateXDaysOld = (days) => new Date(new Date().setDate(new Date().getDate() - days));

const deleteObject = (Key) => {
  try {
    const params = { Bucket: uploadParams.Bucket, Key };
    s3Client.deleteObject(params, (err, data) => {
      if (err) console.error('error', err);
      else console.log('ok delete ', data);
      // antes de responder, guardar en DB.
    });
    return 'ok';
  } catch (error) {
    console.error('error', error);
  }
};

const checkNuevoPedidoAllowed = async (clienteId) => {
  const { permitirNuevoPedido } = await prisma.cliente.findUnique({
    where: {
      id: clienteId
    },
    select: {
      permitirNuevoPedido: true
    }
  })
  if (!permitirNuevoPedido) {
    // no tiene permitido nuevo pedido por autorizador, asi que corroboramos que hayan pasado 15 dias desde el ultimo pedido que pueda tener
    const { value: diasDeEspera } = await prisma.setting.findFirst({
      where: {
        id: 1
      }
    })
    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() - parseInt(diasDeEspera));
    const ultimoPedido = await prisma.pedido.findMany({
      where: {
        clienteId,
        createdAt: {
          gt: dateLimite
        }
      }
    })
    if (ultimoPedido.length) return [false, ` El cliente tiene un pedido realizado dentro de los últimos ${diasDeEspera} días.`]
  }
  return [true, 'OK']
}

module.exports = {
  getSignedUrl,
  passwordEncrypt,
  passwordCompare,
  createToken,
  verifyToken,
  createTokenTest,
  getDateXDaysOld,
  deleteObject,
  checkNuevoPedidoAllowed
};
