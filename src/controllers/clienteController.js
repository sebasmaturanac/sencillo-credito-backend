const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const create = async (req, res) => {
  try {
    const { dni } = req.body;
    // antes de agregar, controlamos que no exista el dni
    const existsCliente = await prisma.cliente.findUnique({
      where: {
        dni,
      },
    });
    if (existsCliente) return res.ingeit400(0, 'El Cliente ya existe. Solo podrá cargar un nuevo pedido');
    const newCliente = await prisma.cliente.create({
      data: { ...req.body },
    });
    return res.ingeit200('Cliente creado con exito', newCliente);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const getClienteById = async (req, res) => {
  try {
    const { clienteId, id = +clienteId } = req.params;
    if (!id) {
      return res.ingeit400(0, 'Debe ingresar un ID de Cliente');
    }
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });
    if (!cliente) {
      return res.ingeit400(0, 'El cliente no existe');
    }
    return res.ingeit200('Cliente', { cliente });
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const searchCliente = async (req, res) => {
  try {
    const { search } = req.params;
    if (!search) return res.ingeit400(0, 'Debe ingresar el texto de busqueda');

    if (search.length < 3) return res.ingeit400(0, 'Debe ingresar al menos 3 caracteres');
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [{ nombre: { contains: search } }, { apellido: { contains: search } }, { dni: { contains: search } }],
      },
    });
    return res.ingeit200('Clientes', { clientes, total: clientes.length });
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const searchClienteByDni = async (req, res) => {
  try {
    const { dni } = req.params;
    if (!dni) return res.ingeit400(0, 'Debe ingresar el dni de busqueda');

    if (dni.length < 7) return res.ingeit400(0, 'Debe ingresar al menos 7 caracteres');
    const cliente = await prisma.cliente.findUnique({
      where: {
        dni,
      },
    });
    return res.ingeit200('Cliente', cliente);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const switchAllowNewPedido = async (req, res) => {
  try {
    const { id } = req.body;
    const { permitirNuevoPedido } = await prisma.cliente.findUnique({
      where: {
        id,
      },
    });
    const newStatePermitirNuevoPedido = !permitirNuevoPedido;
    await prisma.cliente.update({
      data: {
        permitirNuevoPedido: newStatePermitirNuevoPedido,
      },
      where: { id },
    });
    return res.ingeit200(`Se ${newStatePermitirNuevoPedido ? 'habilitó' : 'deshabilito'} el Permitir Nuevo Pedido para el cliente`, {
      id,
      currentState: Boolean(newStatePermitirNuevoPedido),
    });
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

module.exports = {
  create,
  getClienteById,
  searchCliente,
  searchClienteByDni,
  switchAllowNewPedido,
};
