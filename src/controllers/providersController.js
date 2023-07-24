const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const createEntidad = async (req, res) => {
  const nombre = req.body.nombre.trim();
  const tipo = req.body.tipo;
  try {
    const entidad = await prisma.entidad.findFirst({
      where: {
        nombre: {
          contains: nombre,
        },
      },
    });
    if (entidad) return res.ingeit400(0, 'El nombre ya está en uso por otra entidad');
    const newEntidad = await prisma.entidad.create({
      data: {
        nombre,
        tipo,
      },
    });
    await prisma.logs.create({
      data: {
        model: 'entidad',
        action: `create`,
        idTarget: newEntidad.id,
        userId: req.headers.id,
        date: new Date(),
      },
    });
    return res.ingeit200('Nueva entidad', newEntidad);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const getEntidades = async (req, res) => {
  const { include_deleted, includeDeleted = include_deleted === 'true' } = req.query;
  let where = {
    deleted: false,
  };
  if (includeDeleted) {
    where = {};
  }
  try {
    const entidades = await prisma.entidad.findMany({
      orderBy: {
        nombre: 'asc',
      },
      where,
    });
    return res.ingeit200('Entidades', entidades);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const getTipoConsultas = async (_req, res) => {
  try {
    const tipoConsultas = await prisma.tipoConsulta.findMany({
      select: {
        id: true,
        nombre: true,
      },
      where: { deleted: false },
    });
    return res.ingeit200('Entidades', tipoConsultas);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const deleteEntidad = async (req, res) => {
  try {
    const { entidadId, id = +entidadId } = req.params;
    const entidad = await prisma.entidad.findUnique({
      where: { id },
    });
    if (!entidad) return res.ingeit400(0, 'Entidad no encontrada');
    const data = {
      deleted: true,
      deletedAt: new Date(),
    };
    if (entidad.deleted) {
      data.deleted = false;
      data.deletedAt = null;
    }
    await prisma.$transaction([
      prisma.entidad.update({
        data,
        where: { id },
      }),
      prisma.logs.create({
        data: {
          model: 'entidad',
          action: `deleted ${entidad.deleted ? 'off' : 'on'}`,
          idTarget: id,
          userId: req.headers.id,
          date: new Date(),
        },
      }),
    ]);
    const entidadUpdated = await prisma.entidad.findUnique({
      select: { id: true, deleted: true, deletedAt: true },
      where: { id },
    });
    return res.ingeit200(`Se ${entidadUpdated.deleted ? 'deshabilitó' : 'habilitó'} la entidad ${entidad.nombre}`, entidadUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const deleteTipoConsulta = async (req, res) => {
  try {
    const { tipoConsultaId, id = +tipoConsultaId } = req.params;
    const tipoConsulta = await prisma.tipoConsulta.findUnique({
      where: { id },
    });
    if (!tipoConsulta) return res.ingeit400(0, 'Tipo de consulta no encontrado');
    if (tipoConsulta.deleted) return res.ingeit400(0, 'El Tipo de consulta ya se encuentra eliminado');
    await prisma.$transaction([
      prisma.tipoConsulta.update({
        data: { deleted: true },
        where: { id },
      }),
      prisma.logs.create({
        data: {
          model: 'tipoConsulta',
          action: 'delete',
          idTarget: id,
          userId: req.headers.id,
          date: new Date(),
        },
      }),
    ]);
    return res.ingeit200(`Se borró el tipo de consulta '${tipoConsulta.nombre}' correctamente`);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

const updateEntidad = async (req, res) => {
  try {
    const { entidadId, id = +entidadId } = req.params;
    const nombre = req.body.nombre.trim();
    const entidad = await prisma.entidad.findFirst({
      where: {
        nombre: {
          contains: nombre,
        },
      },
    });
    if (entidad) return res.ingeit400(0, 'El nombre ya está en uso por otra entidad o no se detectó un cambio en el nombre');
    const entidadUpdated = await prisma.entidad.update({
      data: {
        nombre,
      },
      where: {
        id,
      },
    });
    await prisma.logs.create({
      data: {
        model: 'entidad',
        action: `update`,
        idTarget: id,
        userId: req.headers.id,
        date: new Date(),
      },
    });
    return res.ingeit200(`Entidad actualizada exitosamente`, entidadUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

module.exports = {
  createEntidad,
  getEntidades,
  getTipoConsultas,
  updateEntidad,
  deleteEntidad,
  deleteTipoConsulta,
};
