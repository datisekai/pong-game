const { gameGetById, isRoom } = require("../game/index");

let users = [];

const canvas = {
  width: 800,
  height: 600,
};


function socketHandler(io) {
  return function (socket) {
    console.log("a user connected", socket.id);

    socket.on("disconnect", () => {
      users = users.filter((item) => item.socketId !== socket.id);
      io.emit("get-user-active", users);
    });

    socket.on("add-user-active", (username) => {
      users.push({ username, socketId: socket.id });
      io.emit("get-user-active", users);
    });

    socket.on("create-room", ({ id }) => {
      const currentUser = users.find((item) => item.socketId === socket.id);

      const game = gameGetById(id, io, canvas);

      game.gameState = {
        player1: {
          user: currentUser,
          x: canvas.width * 0.1,
          y: canvas.height / 2 - 50,
          width: 2,
          height: 100,
          speed: 5,
          point: 0,
          up: false,
          down: false,
        },
        ball: {
          x: canvas.width * 0.15,
          y: canvas.height / 2,
          radius: 10,
          xunits: 1,
          yunits: 0,
          speed: 5,
        },
      };

      game.ballDefault = { ...game.gameState.ball };

      socket.join(id);
      io.in(id).emit("get-room", game.gameState);
    });

    socket.on("join-room", ({ id }) => {
      if (!isRoom(id)) {
        socket.emit("error", { message: "RoomID is invalid" });
        return;
      }
      const currentUser = users.find((item) => item.socketId === socket.id);
      const game = gameGetById(id, io, canvas);

      game.gameState = {
        ...game.gameState,
        player2: {
          user: currentUser,
          x: canvas.width * 0.9,
          y: canvas.height / 2 - 50,
          width: 2,
          height: 100,
          speed: 5,
          point: 0,
          up: false,
          down: false,
        },
      };

      socket.join(id);

      socket
        .to(game.gameState.player1.user.socketId)
        .emit("get-room", game.gameState);
      socket.emit("get-room", game.gameState);
    });

    socket.on("game-start", ({ id }) => {
      const game = gameGetById(id, io, canvas);
      setTimeout(() => {
        if (!game.isPlaying) {
          game.isPlaying = true;
          game.t0 = performance.now()
          console.log(game.t0)
        }
      }, 4000);
      io
        .to(game.gameState.player1.user.socketId)
        .emit("game-started", game.gameState);
      io
        .to(game.gameState.player2.user.socketId)
        .emit("game-started", game.gameState);
    });

    socket.on("user-input", ({ action, id, key }) => {
      const game = gameGetById(id);
      const player =
        game.gameState.player1.user.socketId === socket.id
          ? "player1"
          : "player2";
          console.log(player)
      switch (action) {
        case "up":
          game.gameState[player].up = key === "keydown" ? true : false;
          break;
        case "down":
          game.gameState[player].down = key === "keydown" ? true : false;
          break;
      }
    });
  };
}

module.exports = {
  socketHandler,
};
