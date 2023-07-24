/* eslint-disable  implicit-arrow-linebreak */
// res.ingeit('mensaje') // ingeit solo mensaje, es codigo 0
// res.ingeit('ok', array1) // ingeit mensaje y array de info, es codigo 1 mas info
// res.ingeit('ok', { array1, array2, array3 }) // ingeit mensaje y objetos de array multiple info, es codigo 1 mas info

// probar err
// res.ingeitError(); // error sin nada
// res.ingeitError('todo mal'); // error con mensaje
// res.ingeitError(error); // objeto error directo de mysql error declare handler

const IngeitResponse = (router) => {
  router.use((req, res, next) => {
    res.ingeitMysql = (response) =>
      // respuesta de mysql
      res.status(200).json(response);
    res.ingeitMysqlError = (err) => {
      // aqui pasa mysql reject
      const response = { mensaje: err.mensaje };
      if (err.codigo === 400) response.accion = err.accion; // si el status es 400, por defecto el FRONTEND espera una accion
      console.error(response);
      return res.status(err.codigo).json(response);
    };

    res.ingeit200 = (mensaje = 'OK', array = null) => {
      let response = { mensaje, respuesta: [array] };
      if (Array.isArray(array)) response = { mensaje, respuesta: array };
      if (!array) response.respuesta = [];
      return res.status(200).json(response);
    };

    res.ingeit400 = (accion, mensaje = 'Bad Request') =>
    // seria por defeco accion 0, sino la accion seria en particular para indicar alguna accion en el frontend,
    // como mostar alerta con opciones y no solo aceptar (por ejemplo que no este verificada la cuenta y
    // haya que dar la opcion de reenviar codigo verificador, esto seria con 400, pero con accion = x)
      /**
 LISTADO DE ACCIONES:
 accion: 0 -> solo mensaje de alerta (ej. debe ingresar un nombre valido)
 accion: 1 -> se utiliza para alerta con accion exclusiva de reenviar codigo verificacion.
 */
      res.status(400).json({ accion, mensaje });
    res.ingeit401 = (mensaje = 'Unauthorized') =>
      // normalmente se usa para los token vencidos o para cuando el estado es pendiente de verificar usuario mail por ejemplo
      res.status(401).json({ mensaje });
    res.ingeit402 = (mensaje = 'Payment Required') =>
      // normalmente se usa cuando esta suspendido temporalmente y no puede usar la APP hasta que un admin lo active
      res.status(402).json({ mensaje });
    res.ingeit403 = (mensaje = 'Not versioned', logout = false) =>
      res.status(403).json({ mensaje, logout });

    res.ingeitError = (
      mensaje = 'Problema de comunicación con el servidor',
    ) => {
      console.error(mensaje);
      return res.status(500).json({ mensaje });
    };
    next();
  });
};

module.exports = IngeitResponse;
