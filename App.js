const express = require("express");
const config = require("config");
const app = express();
const winston = require("winston");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origins: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

async function startUP() {
  require("./startup/logging")();
  require("./startup/cors")(app);
  require("./startup/routes")(app);
  await require("./startup/db")();
  require("./startup/config")();
  require("./startup/socket")(io, app);
}

startUP();

const port = process.env.PORT || config.get("port");
const delta = server.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = delta;
