const winston = require("winston");

module.exports = function (io, app) {
  io.on("connection", (socket) => {
    winston.info(socket.id + " Connected");

    socket.on("disconnect", function () {
      //winston.info(socket.id + ' Disconnected')
    });
  });

  io.on("connect_error", (err) => {
    winston.info(`connect_error due to ${err.message}`);
  });
};
