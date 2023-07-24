const { customAlphabet } = require('nanoid');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);
const { checkNuevoPedidoAllowed, deleteObject, getSignedUrl } = require('../ingeitUtils/utils');
const { getDateXDaysOld } = require('../ingeitUtils/utils');
const { getSocketInstance } = require('../socket/socket');
const { pedidoSafeView, pedidosCompleteView } = require('../views/pedidos');
const { PrismaClient, PEDIDOESTADO, ROLE, COMISIONESTADO } = require('@prisma/client');
const XLSX = require('xlsx');
const { sendPushNotification } = require('./oneSignalController');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const getPedidos = {
  VENDEDOR: async ({ id, page, take }) => {
    const skip = (page - 1) * take;
    const {
      _count: { id: total },
    } = await prisma.pedido.aggregate({
      _count: { id: true },
      where: { creadoPorId: { equals: id } },
    });
    const pedidos = await prisma.pedido.findMany({
      select: pedidoSafeView,
      where: {
        creadoPorId: id,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return [pedidos, total];
  },
  COMERCIALIZADORA: async ({ id, page, take }) => {
    const skip = (page - 1) * take;
    const vendedores = await prisma.user.findMany({
      select: { id: true },
      where: { comercializadoraId: id },
    });
    const idVendedores = vendedores.map((vendedor) => vendedor.id);
    const where = {
      creadoPorId: { in: [...idVendedores, id] },
    };
    const {
      _count: { id: total },
    } = await prisma.pedido.aggregate({
      _count: { id: true },
      where,
    });
    const pedidos = await prisma.pedido.findMany({
      select: pedidoSafeView,
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return [pedidos, total];
  },
  AUTORIZADOR: async ({ page, take }) => {
    return getPedidos[ROLE.SUPERUSER]({ page, take });
  },
  SUPERUSER: async ({ page, take }) => {
    const skip = (page - 1) * take;
    const total = await prisma.pedido.count();
    const pedidos = await prisma.pedido.findMany({
      select: pedidosCompleteView,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return [pedidos, total];
  },
};

const estadoCuenta = async (req, res) => {
  try {
    const { id, comercializadoraId } = req.headers;
    if (comercializadoraId) return res.ingeit401('El vendedor pertenece a una comercializadora. No le corresponde un estado de cuenta');

    // get unique param search
    const { string = '' } = req.query;
    if (string && string.length < 3) return res.ingeit400(0, 'Debe ingresar al menos 3 caracteres');
    // constructor paginacion
    const page = parseInt(req.query.page);
    const take = parseInt(req.query.take);
    if (!page || !take) return res.ingeit400(0, 'Falta paginación');
    if (take > 100) return res.ingeit400(0, 'No se pueden mostrar mas de 100 registros por página. Debe seleccionar un valor menor');
    const skip = (page - 1) * take;
    // constructor filtro fecha (si no se quiere filtrar por fecha, no mandar el query fromDate ni el toDate)
    const { fromDate, toDate } = req.query;
    const createdAt = {};
    if (fromDate && toDate) {
      createdAt.gte = new Date(fromDate);
      createdAt.lte = new Date(toDate);
    }
    //  constructor estado (SI SE QUIEREN TODOS LOS ESTADOS, no mandar el query estado)
    const { estado } = req.query;
    let estadoObject;
    if (estado) {
      estadoObject = { equals: estado };
    }
    const whereAND = [
      {
        pedido: {
          creadoPor: {
            OR: [{ id }, { comercializadoraId: id }],
          },
        },
      },
      { createdAt },
      {
        OR: [
          {
            pedido: {
              OR: [
                { numeroPedido: string },
                {
                  creadoPor: {
                    name: { contains: string },
                  },
                },
              ],
            },
          },
        ],
      },
    ];
    const {
      _count: { id: total },
    } = await prisma.pedidoComision.aggregate({
      _count: { id: true },
      where: {
        AND: [{ estado: estadoObject }, ...whereAND],
      },
    });
    const estadoCuenta = await prisma.pedidoComision.findMany({
      skip,
      take,
      include: {
        pedido: {
          select: {
            ...pedidoSafeView,
            creadoPor: {
              select: {
                comercializadora: {
                  select: {
                    name: true,
                  },
                },
                name: true,
              },
            },
          },
        },
      },
      where: {
        AND: [{ estado: estadoObject }, ...whereAND],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalCobrarList = await prisma.pedidoComision.aggregate({
      _sum: {
        monto: true,
      },
      where: {
        AND: [{ estado: 'NO_COBRADO' }, ...whereAND],
      },
    });

    const totalCobrar = totalCobrarList._sum.monto;

    return res.ingeit200('Estado de cuenta', { estadoCuenta, total, totalCobrar });
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const create = async (req, res) => {
  try {
    const { clienteId } = req.body;
    const clienteExists = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!clienteExists) return res.ingeit400(0, 'El cliente no existe');
    // antes de agregar, vemos si al cliente se le puede generar un pedido sin la espera de los dias configurados
    // en caso de que no tenga el permiso, se verifica que el ultimo pedido tenga mas dias de los configurados en el sistema
    const [clientePuedeObtenerNuevoPedido, message] = await checkNuevoPedidoAllowed(clienteId);
    if (!clientePuedeObtenerNuevoPedido) return res.ingeit400(0, message);

    let existsNumeroPedido = true;
    let numeroPedido;
    while (existsNumeroPedido) {
      numeroPedido = nanoid();
      const pedido = await prisma.pedido.findUnique({
        where: { numeroPedido },
      });
      if (!pedido) existsNumeroPedido = false;
    }

    const nuevoPedido = await prisma.pedido.create({
      data: {
        ...req.body,
        numeroPedido,
        creadoPorId: req.headers.id,
        estado: {
          create: {
            estado: PEDIDOESTADO.PENDIENTE,
          },
        },
      },
      select: pedidosCompleteView,
    });
    // y por las dudas este pedido sea en base a que se lo autorizo desde el panel, tenemos que volver a poner en false la propiedad del cliente
    await prisma.cliente.update({
      data: { permitirNuevoPedido: false },
      where: { id: clienteId },
    });
    getSocketInstance().emit('nuevoPedido', nuevoPedido);
    return res.ingeit200('Pedido creado con éxito', nuevoPedido);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const getPedido = async (req, res) => {
  const { pedidoId, id = +pedidoId } = req.params;
  const pedido = await prisma.pedido.findUnique({
    select: pedidosCompleteView,
    where: { id },
  });
  if (!pedido) return res.ingeit400(0, 'El pedido no existe');
  return res.ingeit200('Pedido', pedido);
};

// este search puede ser el listar pedidos para superuser y autorizadores, ya que si no se envia rango de fecha, ni string de busqueda, ni estado, se devuelve todo con paginacion
const searchPedido = async (req, res) => {
  try {
    // get unique param search
    const { string = '' } = req.query;
    if (string && string.length < 3) return res.ingeit400(0, 'Debe ingresar al menos 3 caracteres');
    // constructor paginacion
    const page = parseInt(req.query.page);
    const take = parseInt(req.query.take);
    if (!page || !take) return res.ingeit400(0, 'Falta paginación');
    if (take > 1000) return res.ingeit400(0, 'No se pueden mostrar mas de 1000 registros por página. Debe seleccionar un valor menor');
    const skip = (page - 1) * take;
    // constructor filtro fecha (si no se quiere filtrar por fecha, no mandar el query fromDate ni el toDate)
    const { fromDate, toDate } = req.query;
    const createdAt = {};
    if (fromDate && toDate) {
      createdAt.gte = new Date(fromDate);
      createdAt.lte = new Date(toDate);
    }
    //  constructor estado (SI SE QUIEREN TODOS LOS ESTADOS, no mandar el query estado)
    const { estado } = req.query;
    const estadoObject = {};
    if (estado) {
      const estadoQuery = estado === PEDIDOESTADO.PENDIENTE_DE_MARGEN ? [PEDIDOESTADO.PENDIENTE_DE_MARGEN_OK] : [];
      estadoObject.estado = {
        in: [estado, ...estadoQuery],
      };
    }
    const { comision } = req.query;
    const comisionObject = {};
    if (comision) {
      comisionObject.estado = { equals: comision };
    }

    const OR = [
      {
        numeroPedido: string,
      },
      {
        cliente: {
          OR: [{ nombre: { contains: string } }, { apellido: { contains: string } }, { dni: { contains: string } }],
        },
      },
      {
        entidad: {
          nombre: { contains: string },
        },
      },
    ];
    const { userId } = req.query;
    const creadoPorObject = {};
    let select = pedidosCompleteView;
    if (req.headers.role === ROLE.AUTORIZADOR || req.headers.role === ROLE.SUPERUSER) {
      if (userId) {
        let creadoPorId = parseInt(userId);
        creadoPorObject.id = creadoPorId;
      } else {
        OR.push({
          creadoPor: {
            OR: [
              { name: { contains: string } },
              {
                comercializadora: {
                  name: { contains: string },
                },
              },
            ],
          },
        });
      }
    } else {
      if (!req.headers.comercializadoraId) {
        select = {
          ...select,
          comision: {
            select: {
              id: true,
              monto: true,
              porcentaje: true,
              estado: true,
              cobradoAt: true,
              createdAt: true,
            },
          },
        };
      }
      if (req.headers.role === ROLE.COMERCIALIZADORA) {
        const vendedores = await prisma.user.findMany({
          select: { id: true },
          where: { comercializadoraId: req.headers.id },
        });
        const idVendedores = vendedores.map((vendedor) => vendedor.id);
        creadoPorObject.id = {
          in: [...idVendedores, req.headers.id],
        };
      }
      if (req.headers.role === ROLE.VENDEDOR) {
        creadoPorObject.id = req.headers.id;
      }
    }
    const where = {
      createdAt,
      estado: estadoObject,
      comision: comisionObject,
      creadoPor: creadoPorObject,
      OR,
    };

    const {
      _count: { id: total },
    } = await prisma.pedido.aggregate({
      _count: { id: true },
      where,
    });
    const pedidos = await prisma.pedido.findMany({
      skip,
      take,
      where,
      select,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.ingeit200('Search pedidos', { pedidos, total });
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const getSignedS3URL = (attachmentFiles) => {
  return attachmentFiles.map((attachment) => ({
    ...attachment,
    url: getSignedUrl(attachment.url),
  }));
};

const getAttachments = async (req, res) => {
  const { pedidoId, id = +pedidoId } = req.params;
  const pedido = await prisma.pedido.findUnique({
    select: { attachmentFiles: true, creadoPorId: true },
    where: { id },
  });
  if (!pedido) res.ingeit400(0, 'El pedido no existe');
  if (!pedido.attachmentFiles) res.ingeit400(0, 'El pedido no contiene archivos');
  if (req.headers.role === ROLE.VENDEDOR && req.headers.id !== pedido.creadoPorId) {
    return res.ingeit400(0, 'El pedido no pertenece a usted');
  }
  const attachments = getSignedS3URL(pedido.attachmentFiles);
  return res.ingeit200('Attachments', attachments);
};

const dispatchGetPedidos = async (req, res) => {
  try {
    // traemos clientes segun rol de quien lo pida, si es un vendedor, tenemos q mostrar solo sus clientes con los pedidos.
    // si es comercializadora, tenemos q traer todos los clientes de sus vendedores,
    // si es superuser o autorizador, traemos todo
    const { role, id } = req.headers;
    const { page, take } = req.query;
    if (!page || !take) return res.ingeit400(0, 'Falta paginación');
    if (take > 100) return res.ingeit400(0, 'No se pueden mostrar mas de 100 registros por página. Debe seleccionar un valor menor');
    const [pedidos, total] = await getPedidos[role]({
      id,
      page: parseInt(page),
      take: parseInt(take),
    });
    return res.ingeit200('Pedidos', { pedidos, total });
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const switchRevision = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    const pedidoEstadoExists = await prisma.pedidoEstado.findUnique({
      where: { pedidoId },
      select: {
        estado: true,
        enRevision: true,
        autorizadorId: true,
      },
    });
    if (!pedidoEstadoExists) return res.ingeit400(0, 'El pedido no existe');
    const { estado, autorizadorId, enRevision } = pedidoEstadoExists;
    if (estado === PEDIDOESTADO.APROBADO || estado === PEDIDOESTADO.RECHAZADO)
      return res.ingeit400(0, `No se puede modificar el estado de un pedido ya ${estado}`);
    if (enRevision && autorizadorId !== req.headers.id) return res.ingeit400(0, 'No puede sacar de revision un pedido que usted no esta revisando');
    const newEnRevision = !enRevision;
    const autorizador = newEnRevision ? { name: req.headers.name, id: req.headers.id } : null;
    const pedidoEstado = await prisma.pedidoEstado.update({
      data: {
        autorizadorId: autorizador?.id || null,
        enRevision: newEnRevision,
      },
      where: { pedidoId },
    });
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: pedidosCompleteView,
    });
    getSocketInstance().emit('revision', pedido);
    return res.ingeit200(`El estado del pedido cambió a ${newEnRevision ? 'EN_REVISION' : estado}`, pedidoEstado);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const setComisionPagada = async (req, res) => {
  const { comisionId, id = +comisionId } = req.params;
  const comision = await prisma.pedidoComision.findUnique({
    where: { id },
  });
  if (!comision) return res.ingeit400(0, 'La comisión a pagar no existe');
  if (comision.estado === COMISIONESTADO.COBRADO) return res.ingeit400(0, 'La comisión ya se encuentra pagada');
  const pedidoComisionUpdated = await prisma.pedidoComision.update({
    data: { estado: COMISIONESTADO.COBRADO, cobradoAt: new Date() },
    where: { id },
  });
  return res.ingeit200(`Comisión pagada correctamente`, pedidoComisionUpdated);
};

const cambiarMontoSolicitado = async (req, res) => {
  try {
    const { pedidoId, montoSolicitado } = req.body;
    const pedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      include: {
        estado: true,
        cliente: true,
        comision: true,
      },
    });
    if (!pedido) return res.ingeit400(0, 'El pedido no existe');
    if (pedido.estado === PEDIDOESTADO.APROBADO || pedido.estado == PEDIDOESTADO.RECHAZADO) {
      return res.ingeit400(0, 'No se puede modificar el monto solicitado de un pedido ya aprobado o rechazado');
    }
    let comision;
    if (pedido.comision?.porcentaje) {
      comision = {
        update: {
          monto: montoSolicitado * (pedido.comision.porcentaje / 100),
        },
      };
    }
    const pedidoModificado = await prisma.pedido.update({
      data: {
        montoSolicitado,
        comision,
      },
      where: {
        id: pedidoId,
      },
    });

    const oldMontoSolicitado = pedido.montoSolicitado;

    const senderUserId = req.headers.id;
    const title = 'Monto modificado';
    const body = `El monto que usted solicito para el pedido ${pedido.numeroPedido} del cliente - DNI: ${pedido.cliente.dni} - ${pedido.cliente.nombre} ${pedido.cliente.apellido} ha sido modificado. 
    Valor anterior: $${oldMontoSolicitado}, nuevo valor propuesto: $${montoSolicitado}`;

    await prisma.message.create({
      data: {
        title,
        body,
        users: {
          create: {
            senderUserId,
            destinationUserId: pedido.creadoPorId,
            conversationThread: nanoid(),
          },
        },
      },
    });
    const destinationUser = await prisma.user.findUnique({
      select: {
        pushNotificationToken: true,
      },
      where: {
        id: pedido.creadoPorId,
      },
    });
    sendPushNotification({
      title,
      body,
      tokens: [destinationUser.pushNotificationToken],
    });
    return res.ingeit200(`Monto solicitado modificado correctamente`, pedidoModificado);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const getComisionesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const comisiones = await prisma.pedidoComision.findMany({
      where: {
        pedido: {
          creadoPorId: userId,
        },
      },
    });
    if (!comisiones.length) res.ingeit400(0, 'No existen comisiones para el usuario seleccionado');
    return res.ingeit200('Comisiones', comisiones);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const setComisionesPagadas = async (req, res) => {
  try {
    const { comisionesId } = req.body;
    if (!comisionesId.length) res.ingeit400(0, 'Debe seleccionar al menos una comisión a pagar');
    const comisionesUpdated = await prisma.pedidoComision.updateMany({
      data: {
        estado: COMISIONESTADO.COBRADO,
        cobradoAt: new Date(),
      },
      where: {
        id: {
          in: comisionesId,
        },
        pedido: {
          estado: {
            estado: PEDIDOESTADO.APROBADO,
          },
        },
        estado: COMISIONESTADO.NO_COBRADO,
      },
    });
    return res.ingeit200('Comisiones pagadas con éxito', comisionesUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const setRegaliaPagada = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    const existsPedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
    });
    if (!existsPedido) return res.ingeit400(0, 'Pedido no encontrado');
    if (existsPedido.regaliaCobrada) return res.ingeit400(0, 'La regalia ya se encuentra pagada');

    const pedidoUpdated = await prisma.pedido.update({
      data: {
        regaliaCobrada: true,
      },
      where: {
        id: pedidoId,
      },
    });

    return res.ingeit200('Regalia pagada con éxito', pedidoUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { pedidoId, cantidadCuotas, montoCuota, montoAutorizado, estado: newEstado, comentario } = req.body;
    const pedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      include: {
        estado: true,
        cliente: true,
        comision: true,
      },
    });
    const pedidoEstado = await prisma.pedidoEstado.findUnique({
      where: { pedidoId },
    });
    if (!pedidoEstado) return res.ingeit400(0, 'El pedido no existe');
    if (pedidoEstado.estado === PEDIDOESTADO.APROBADO || pedidoEstado.estado === PEDIDOESTADO.RECHAZADO)
      return res.ingeit400(0, `No se puede modificar el estado de un pedido ya ${pedidoEstado.estado}`);
    if (
      [PEDIDOESTADO.PENDIENTE, PEDIDOESTADO.PENDIENTE_DE_MARGEN, PEDIDOESTADO.PENDIENTE_DE_MARGEN_OK].includes(pedidoEstado.estado) &&
      !pedidoEstado.enRevision
    )
      return res.ingeit400(0, `Para modificar el estado de un pedido, primero se debe encontrar EN REVISION por usted `);
    const { autorizadorId } = pedidoEstado;
    if (autorizadorId !== req.headers.id)
      return res.ingeit400(0, `El pedido se encuentra EN REVISION por otro autorizador. Permiso denegado para cambiar el estado`);
    const pedidoCreadoPor = await prisma.user.findFirst({
      where: {
        id: pedido.creadoPorId,
      },
    });
    if (newEstado === PEDIDOESTADO.RECHAZADO) {
      const pedidoEstadoUpdate = await prisma.pedidoEstado.update({
        data: {
          estado: newEstado,
          comentario,
          fecha: new Date(),
        },
        where: { pedidoId },
      });
      const pedidoUpdated = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: pedidosCompleteView,
      });
      getSocketInstance().emit('revision', pedidoUpdated);
      return res.ingeit200(`Se ha ${newEstado} el pedido correctamente`, pedidoEstadoUpdate);
    } else if (newEstado === PEDIDOESTADO.APROBADO) {
      let regalia = null;
      if (!pedidoCreadoPor.comercializadoraId) {
        const pedidosExistentesVendedor = await prisma.pedido.findMany({
          where: {
            creadoPorId: pedidoCreadoPor.id,
            estado: {
              estado: PEDIDOESTADO.APROBADO,
            },
          },
        });
        if (!pedidosExistentesVendedor.length) {
          regalia = req.body.regalia;
        }
      }
      const prismaTransactionQuery = [];
      const porcentajeComision = req.body.porcentajeComision;
      prismaTransactionQuery.push(
        prisma.pedidoEstado.update({
          data: {
            estado: newEstado,
            comentario,
            fecha: new Date(),
            montoAutorizado,
            cantidadCuotas,
            montoCuota,
          },
          where: { pedidoId },
        }),
        prisma.pedidoComision.create({
          data: {
            monto: (montoAutorizado * porcentajeComision) / 100,
            porcentaje: porcentajeComision,
            pedidoId,
            userId: pedidoCreadoPor.comercializadoraId ?? pedidoCreadoPor.id,
          },
        }),
        prisma.pedido.update({
          data: {
            regalia,
          },
          where: {
            id: pedidoId,
          },
        })
      );
      const [pedidoEstadoUpdate] = await prisma.$transaction(prismaTransactionQuery);
      const pedidoUpdated = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: pedidosCompleteView,
      });
      getSocketInstance().emit('revision', pedidoUpdated);
      return res.ingeit200(`Se ha ${newEstado} el pedido correctamente`, pedidoEstadoUpdate);
    } else if (newEstado === PEDIDOESTADO.PENDIENTE_DE_MARGEN) {
      const pedidoEstadoUpdate = await prisma.pedidoEstado.update({
        data: {
          estado: newEstado,
          comentario,
          fecha: new Date(),
        },
        where: { pedidoId },
      });
      const pedidoUpdated = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: pedidosCompleteView,
      });
      getSocketInstance().emit('revision', pedidoUpdated);
      const senderUserId = req.headers.id;
      const title = 'PENDIENTE DE MARGEN NECESARIO';
      const body = `Se necesita adjuntar la imagen de PENDIENTE DE MARGEN para el pedido ${pedido.numeroPedido} del cliente - DNI: ${pedido.cliente.dni} - ${pedido.cliente.nombre} ${pedido.cliente.apellido}`;

      await prisma.message.create({
        data: {
          title,
          body,
          users: {
            create: {
              senderUserId,
              destinationUserId: pedido.creadoPorId,
              conversationThread: nanoid(),
            },
          },
        },
      });
      const destinationUser = await prisma.user.findUnique({
        select: {
          pushNotificationToken: true,
        },
        where: {
          id: pedido.creadoPorId,
        },
      });
      sendPushNotification({
        title,
        body,
        tokens: [destinationUser.pushNotificationToken],
      });
      return res.ingeit200(`Se ha cambiado el estado del pedido a PENDIENTE DE MARGEN correctamente`, pedidoEstadoUpdate);
    }
    return res.ingeit400(0, `Solo puede cambiar el estado de un pedido a APROBAR o RECHAZAR o PENDIENTE DE MARGEN`);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const pendienteMargenOk = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    const pedidoEstado = await prisma.pedidoEstado.findUnique({
      where: { pedidoId },
    });
    if (!pedidoEstado) return res.ingeit400(0, 'El pedido no existe');
    if (pedidoEstado.estado !== PEDIDOESTADO.PENDIENTE_DE_MARGEN)
      return res.ingeit400(0, `El pedido no se encuentra en pendiente de margen, por lo tanto ésta acción no será ejecutada.`);

    const pedidoEstadoUpdate = await prisma.pedidoEstado.update({
      data: {
        estado: PEDIDOESTADO.PENDIENTE_DE_MARGEN_OK,
        fecha: new Date(),
      },
      where: { pedidoId },
    });
    const pedidoUpdated = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: pedidosCompleteView,
    });
    getSocketInstance().emit('revision', pedidoUpdated);
    return res.ingeit200(`Se ha modificado el pedido correctamente`, pedidoEstadoUpdate);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const deleteObjectsS3 = async () => {
  try {
    const { value, DIAS_ESPERA_ELIMINAR_ARCHIVOS_ADJUNTOS = +value } = await prisma.setting.findUnique({
      where: { id: 2 },
    });
    const attachmentsToRemove = await prisma.attachmentFile.findMany({
      select: {
        pedidoId: true,
        url: true,
      },
      where: {
        pedido: {
          createdAt: {
            lt: getDateXDaysOld(DIAS_ESPERA_ELIMINAR_ARCHIVOS_ADJUNTOS),
          },
        },
      },
    });
    if (!attachmentsToRemove.length) {
      console.log(`No se encontraron archivos adjuntos viejos para eliminar`);
      return [false, `No se encontraron archivos adjuntos viejos para eliminar`];
    }
    for (const attachment of attachmentsToRemove) {
      deleteObject(attachment.url);
    }
    const idPedidos = attachmentsToRemove.map((attachment) => attachment.pedidoId);
    await prisma.attachmentFile.deleteMany({
      where: {
        pedidoId: {
          in: idPedidos,
        },
      },
    });
    console.log(`OK. Se han eliminado correctamente los archivos adjuntos`);
    return [true, `Se han eliminado correctamente los archivos adjuntos`];
  } catch (error) {
    console.error('error', error);
    return [false, `No se encontraron archivos adjuntos viejos para eliminar`];
  }
};

const deleteOldAttachments = async (_req, res) => {
  try {
    const [status, message] = await deleteObjectsS3();
    if (!status) return res.ingeit400(0, message);
    return res.ingeit200(message);
  } catch (error) {
    return res.ingeitError(error);
  }
};

const exportarExcel = async (req, res) => {
  try {
    // get unique param search
    const { string = '' } = req.query;
    if (string && string.length < 3) return res.ingeit400(0, 'Debe ingresar al menos 3 caracteres');
    // constructor paginacion
    // constructor filtro fecha (si no se quiere filtrar por fecha, no mandar el query fromDate ni el toDate)
    const { fromDate, toDate } = req.query;
    const createdAt = {};
    if (fromDate && toDate) {
      createdAt.gte = new Date(fromDate);
      createdAt.lte = new Date(toDate);
    }
    //  constructor estado (SI SE QUIEREN TODOS LOS ESTADOS, no mandar el query estado)
    const { estado } = req.query;
    const estadoObject = {};
    if (estado) {
      estadoObject.estado = { equals: estado };
    }
    const { comision } = req.query;
    const comisionObject = {};
    if (comision) {
      comisionObject.estado = { equals: comision };
    }

    const OR = [
      {
        numeroPedido: string,
      },
      {
        cliente: {
          OR: [{ nombre: { contains: string } }, { apellido: { contains: string } }, { dni: { contains: string } }],
        },
      },
      {
        entidad: {
          nombre: { contains: string },
        },
      },
    ];
    const { userId } = req.query;
    const creadoPorObject = {};
    let select = pedidosCompleteView;
    if (req.headers.role === ROLE.AUTORIZADOR || req.headers.role === ROLE.SUPERUSER) {
      if (userId) {
        let creadoPorId = parseInt(userId);
        creadoPorObject.id = creadoPorId;
      } else {
        OR.push({
          creadoPor: {
            OR: [
              { name: { contains: string } },
              {
                comercializadora: {
                  name: { contains: string },
                },
              },
            ],
          },
        });
      }
    } else {
      if (!req.headers.comercializadoraId) {
        select = {
          ...select,
          comision: {
            select: {
              id: true,
              monto: true,
              porcentaje: true,
              estado: true,
              cobradoAt: true,
              createdAt: true,
            },
          },
        };
      }
      if (req.headers.role === ROLE.COMERCIALIZADORA) {
        const vendedores = await prisma.user.findMany({
          select: { id: true },
          where: { comercializadoraId: req.headers.id },
        });
        const idVendedores = vendedores.map((vendedor) => vendedor.id);
        creadoPorObject.id = {
          in: [...idVendedores, req.headers.id],
        };
      }
      if (req.headers.role === ROLE.VENDEDOR) {
        creadoPorObject.id = req.headers.id;
      }
    }
    const where = {
      createdAt,
      estado: estadoObject,
      comision: comisionObject,
      creadoPor: creadoPorObject,
      OR,
    };

    const pedidos = await prisma.pedido.findMany({
      where,
      select,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const fileName = 'Pedidos.xlsx';
    const pedidosExcel = pedidos.map((pedido) => ({
      'Numero pedido': pedido.numeroPedido,
      'Monto solicitado': parseFloat(pedido.montoSolicitado),
      'Entidad nombre': pedido.entidad.nombre,
      'Entidad tipo': pedido.entidad.tipo,
      'Tipo de consulta': pedido.tipoConsulta.nombre,
      'Cliente nombre': pedido.cliente.nombre,
      'Cliente apellido': pedido.cliente.apellido,
      'Cliente DNI': pedido.cliente.dni,
      'Cliente sexo': pedido.cliente.sexo,
      Vendedor: pedido.creadoPor.name,
      'Vendedor pertenece a comercializadora': pedido.creadoPor.comercializadora?.name || '-',
      'Vendedor comentario': pedido.comentarioVendedor,
      Estado: pedido.estado.estado,
      'Monto autorizado': parseFloat(pedido.estado.montoAutorizado) || '-',
      'Cantidad cuotas': pedido.estado.cantidadCuotas || '-',
      'Monto cuotas': parseFloat(pedido.estado.montoCuota) || '-',
      Autorizador: pedido.estado.autorizador?.name || '-',
      'Autorizador comentario': pedido.estado.comentario || '-',
      'Fecha de revision': pedido.estado.fecha,
      'Comision del pedido': parseFloat(pedido.comision?.monto) || '-',
      'Comision porcentaje': pedido.comision?.porcentaje || '-',
      'Comision estado': pedido.comision?.estado || '-',
      'Comision fecha cobrada': pedido.comision?.cobradoAt || '-',
      Regalia: pedido.regalia || '-',
    }));
    if (pedidosExcel.length) {
      // enviamos el excel
      const ws = XLSX.utils.json_to_sheet(pedidosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
      const file = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      res.status(200).send(file);
    }
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

module.exports = {
  create,
  getPedido,
  estadoCuenta,
  searchPedido,
  getAttachments,
  dispatchGetPedidos,
  cambiarEstado,
  pendienteMargenOk,
  setComisionPagada,
  setRegaliaPagada,
  getComisionesByUserId,
  setComisionesPagadas,
  switchRevision,
  deleteOldAttachments,
  deleteObjectsS3,
  exportarExcel,
  cambiarMontoSolicitado,
};
