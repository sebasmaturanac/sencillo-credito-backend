const pedidoSafeView = {
  id: true,
  montoSolicitado: true,
  comentarioVendedor: true,
  numeroPedido: true,
  regalia: true,
  regaliaCobrada: true,
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
      dni: true,
      sexo: true,
    },
  },
  entidad: true,
  creadoPor: {
    select: {
      name: true,
    },
  },
  tipoConsulta: true,
  estado: {
    select: {
      estado: true,
      enRevision: true,
      montoAutorizado: true,
      cantidadCuotas: true,
      montoCuota: true,
      comentario: true,
      fecha: true,
      autorizador: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
};

const pedidosCompleteView = {
  ...pedidoSafeView,
  cliente: {
    select: {
      ...pedidoSafeView.cliente.select,
      permitirNuevoPedido: true,
    },
  },
  creadoPor: {
    select: {
      id: true,
      name: true,
      comercializadora: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  estado: {
    select: {
      estado: true,
      enRevision: true,
      montoAutorizado: true,
      cantidadCuotas: true,
      montoCuota: true,
      comentario: true,
      fecha: true,
      autorizador: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  comision: {
    select: {
      id: true,
      monto: true,
      porcentaje: true,
      estado: true,
      cobradoAt: true,
      createdAt: true,
      userId: true
    },
  },
};

module.exports = { pedidoSafeView, pedidosCompleteView };
