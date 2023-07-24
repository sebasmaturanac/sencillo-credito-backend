const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  const _io = socketIo(server, { serveClient: false });
  if (!io) io = _io;
  io.origins('*:*');
  io.on('connection', (socket) => {
    socket.emit('connected', 'OK');
  });
};

const getSocketInstance = () => io;

module.exports = { initSocket, getSocketInstance };
