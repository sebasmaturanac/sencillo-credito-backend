const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cron = require('node-cron');
const apiRouter = require('./routes/api');
const { deleteObjectsS3 } = require('./controllers/pedidoController');

const app = express();

/* LOGS WITH MORGAN ****************************************************** */
app.use(morgan(':method :url status(:status) - :response-time ms'));
/* *********************************************************************** */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options('*', cors());
app.use(helmet());

/* ROUTER **************************************************************** */
app.use('/api', apiRouter);
app.use((_req, res) => {
  res.status(404).send('Recurso no disponible');
});
/* *********************************************************************** */

// ********* SCHEDULER ***********************
cron.schedule('0 0 * * *', deleteObjectsS3);
module.exports = app;
