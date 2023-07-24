const { s3Client, uploadParams } = require('../config/s3.config');
const multer = require('multer');
const imageThumbnail = require('image-thumbnail');
const { PrismaClient } = require('@prisma/client');
const { deleteObject } = require('../ingeitUtils/utils');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const MB = 1000000;
const multerInstance = (name) => {
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

const doUpload = async (req, res) => {
  try {
    const { pedidoId, file } = req.body;
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(pedidoId) },
    });
    if (!pedido) return res.ingeit400(0, `El pedido no existe`);
    const target = Date.now().toString();
    const mimetype = 'image/jpg';
    const options = { height: 1080, responseType: 'buffer', fit: 'inside' };
    const base64 = await imageThumbnail(file, options);
    const Key = `${'sencillo_creditos'}-pedidoId_${pedidoId}-target_${target}.jpg`;
    const params = { ...uploadParams, Key, Body: base64 };
    s3Client.upload(params, async (err) => {
      if (err) return res.ingeitError(err);
      // antes de responder, guardar en DB.
      try {
        const newAttachment = await prisma.attachmentFile.create({
          data: {
            mimetype,
            url: Key,
            target,
            pedidoId: parseInt(pedidoId),
          },
        });
        return res.ingeit200('Imagenes subidas correctamente', newAttachment);
      } catch (error) {
        deleteObject(Key);
        console.error('error', error);
        return res.ingeitError(error);
      }
    });
  } catch (error) {
    console.error('error', error);
    return res.ingeitError(error);
  }
};

const removeItem = async (req, res) => {
  try {
    const { url } = req.params;
    const attachment = await prisma.attachmentFile.findFirst({
      where: {
        url,
      },
    });
    if (!attachment) return res.ingeit400(0, `La imagen no existe`);
    deleteObject(url);
    await prisma.attachmentFile.delete({
      where: {
        pedidoId_target: {
          pedidoId: attachment.pedidoId,
          target: attachment.target,
        },
      },
    });
    return res.ingeit200('Imagen eliminada correctamente');
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

// const doUpload = async (req, res) => {
//   try {
//     const { pedidoId, target, imageUrl } = req.body;
//     console.log("imageUrl",imageUrl)
//     const { buffer, mimetype, size } = req.file;
//     const pedido = await prisma.pedido.findUnique({
//       where: { id: parseInt(pedidoId) },
//     });
//     if (!pedido) return res.ingeit400(0, `El pedido no existe`);
//     const attachmentsPedidos = await prisma.attachmentFile.findMany({
//       where: { pedidoId: parseInt(pedidoId) },
//     });
//     const existsAttachment = attachmentsPedidos.filter((attachment) => attachment.pedidoId === parseInt(pedidoId) && attachment.target === target);
//     if (existsAttachment.length) return res.ingeit400(0, `El pedido ya tiene un archivo adjunto para ${target}`);
//     const { value, MAX_FILE_SIZE_MB = +value } = await prisma.setting.findUnique({
//       where: { id: 3 },
//     });
//     let file = buffer;
//     const [type, extension] = mimetype.split('/');
//     if (size / 1024 / 1024 > MAX_FILE_SIZE_MB) return res.ingeit400(0, 'Solo se permiten archivos menores a 10 Mb');
//     if (type === 'application' && extension !== 'pdf') return res.ingeit400(0, 'Solo se permiten archivos PDF o imagenes');
//     if (type === 'image') {
//       const options = { width: 1920, height: 1920, responseType: 'buffer', fit: 'inside' };
//       file = await imageThumbnail(buffer, options);
//     }
//     const Key = `${'sencillo_creditos'}-pedidoId-${pedidoId}-${target}.${extension}`;
//     const params = { ...uploadParams, Key, Body: file };
//     s3Client.upload(params, async (err) => {
//       if (err) return res.ingeitError(err);
//       // antes de responder, guardar en DB.
//       try {
//         const newAttachment = await prisma.attachmentFile.create({
//           data: {
//             mimetype,
//             url: Key,
//             target,
//             pedidoId: parseInt(pedidoId),
//           },
//         });
//         return res.ingeit200('Imagen subida correctamente', newAttachment);
//       } catch (error) {
//         deleteObject(Key);
//         console.error('error', error);
//         return res.ingeitError(error);
//       }
//     });
//   } catch (error) {
//     console.error('error', error);
//     return res.ingeitError(error);
//   }
// };

module.exports = {
  doUpload,
  removeItem,
  multerInstance,
};
