const { PrismaClient, ROLE } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const getPedidos = {
  VENDEDOR: async ({ id }) => {
    const response = await prisma.$transaction([
      prisma.pedidoEstado.groupBy({
        by: ['estado'],
        _count: true,
        where: {
          pedido: {
            creadoPorId: id,
          },
        },
      }),
      prisma.$queryRaw`
        SELECT YEAR(pe.fecha) year, MONTH(pe.fecha) month, SUM(pe.montoAutorizado) total FROM PedidoEstado pe
        INNER JOIN Pedido p ON pe.pedidoId = p.id
        INNER JOIN User u ON u.id = p.creadoPorId
        WHERE pe.fecha > NOW() - INTERVAL 11 MONTH 
        AND pe.estado = 'APROBADO'
        AND p.creadoPorId = ${id}
        GROUP BY year, month ORDER BY year ASC, month ASC
    `,
    ]);
    return {
      groupEstadosTotal: response[0],
      montoAutorizadoTotalByRangeDate: response[1],
    };
  },
  COMERCIALIZADORA: async ({ id }) => {
    const response = await prisma.$transaction([
      prisma.pedidoEstado.groupBy({
        by: ['estado'],
        _count: true,
        where: {
          pedido: {
            OR: [{ creadoPorId: id }, { creadoPor: { comercializadora: { id } } }],
          },
        },
      }),
      prisma.$queryRaw`
        SELECT YEAR(pe.fecha) year, MONTH(pe.fecha) month, SUM(pe.montoAutorizado) total FROM PedidoEstado pe
        INNER JOIN Pedido p ON pe.pedidoId = p.id
        INNER JOIN User u ON u.id = p.creadoPorId
        WHERE pe.fecha > NOW() - INTERVAL 11 MONTH 
        AND pe.estado = 'APROBADO'
        AND (p.creadoPorId = ${id} OR u.comercializadoraId = ${id})
        GROUP BY year, month ORDER BY year ASC, month ASC
      `,
      prisma.$queryRaw`
        SELECT u.id, u.name, COUNT(p.id) total, pe.estado FROM Pedido p 
        INNER JOIN PedidoEstado pe ON pe.pedidoId = p.id
        INNER JOIN User u ON u.id = p.creadoPorId
        WHERE (p.creadoPorId = ${id} OR u.comercializadoraId = ${id}) AND (pe.estado = 'APROBADO' OR pe.estado = 'RECHAZADO')
        GROUP BY u.name, pe.estado, u.id
      `,
    ]);
    return {
      groupEstadosTotal: response[0],
      montoAutorizadoTotalByRangeDate: response[1],
      groupEstadosByUser: response[2],
    };
  },
  AUTORIZADOR: async () => {
    return getPedidos[ROLE.SUPERUSER]();
  },
  SUPERUSER: async () => {
    const response = await prisma.$transaction([
      prisma.pedidoEstado.groupBy({
        by: ['estado'],
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT YEAR(fecha) year, MONTH(fecha) month, SUM(montoAutorizado) total
        FROM PedidoEstado WHERE fecha > NOW() - INTERVAL 11 MONTH AND estado = 'APROBADO'
        GROUP BY year, month ORDER BY year ASC, month ASC
      `,
    ]);
    return {
      groupEstadosTotal: response[0],
      montoAutorizadoTotalByRangeDate: response[1],
    };
  },
};

const getEstadisticas = async (req, res) => {
  try {
    const { role, id } = req.headers;
    const pedidoEstadoTotalCount = await getPedidos[role]({ id });
    return res.ingeit200('Entidades', pedidoEstadoTotalCount);
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json(error);
  }
};

module.exports = {
  getEstadisticas,
};
