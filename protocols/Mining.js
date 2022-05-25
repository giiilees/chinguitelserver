module.exports = {
  startProtocol: async function ({ socket, io, defficulty, block }) {
    const sockets = await io.fetchSockets();
    io.emit("MineRequest", { defficulty, block });
    const result = await new Promise((resolve) => {
      socket.once("MineDone", (answer) => {
        resolve({ ok: true, data: answer });
      });
    });

    return { ok: true, data: result.data };
  },
};
