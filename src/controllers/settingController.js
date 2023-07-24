const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const getAll = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({});
    return res.ingeit200('Settings', settings);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

const update = async (req, res) => {
  try {
    const { settingId, id = +settingId, value } = req.body;
    const settingUpdated = await prisma.setting.update({
      data: { value },
      where: { id },
    });
    await prisma.logs.create({
      data: {
        model: 'setting',
        action: `update`,
        idTarget: id,
        userId: req.headers.id,
        date: new Date(),
      },
    });
    return res.ingeit200('Se modificó la configuración', settingUpdated);
  } catch (error) {
    console.error('error: ', error);
    return res.ingeitError(error);
  }
};

module.exports = {
  getAll,
  update,
};
