const ensureRole = (arrayRoles) => (req, res, next) => {
  const { role } = req.headers;
  if (!arrayRoles.includes(role))
    return res.ingeit401('No tiene permisos para realizar esta tarea');
  return next();
};

module.exports = ensureRole;
