let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

//Get Element
const ulUserOnline = document.querySelector("#user-online ul");
const ulUserRoom = document.querySelector("#user-room ul");
const divAction = document.querySelector("#action");

const btnCreateRoom = document.querySelector("#create-room");
const btnJoinRoom = document.querySelector("#join-room");
const inputRoom = document.querySelector("#input-room");
const btnPlay = document.querySelector("#btn-play");
const textGuide = document.querySelector("#guide span");
const guide = document.querySelector("#guide");
const btnResetPoint = document.querySelector("#btn-reset-point");

//Init username
const username = (Math.random() + 1).toString(36).substring(7);

let player, opponent, ball;
let isPlaying = false;
let roomId,
  gameState = {};
let playerIndex;

function renderAction() {
  if (roomId) {
    const currentUser =
      gameState.player1.user.username === username ? "player1" : "player2";
    const html = ` <div class="flex items-center gap-2 ">
    <p class='text-white text-lg font-bold'>RoomID: ${roomId}</p>
    <div class="divider lg:divider-horizontal text-white">AND</div>
    <p class='text-white text-lg font-bold'>You are ${currentUser}</p>
  </div>`;
    divAction.innerHTML = html;
  }
}

function drawBG() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initBall() {
  const ball_x = canvas.width * 0.15;
  const ball_y = canvas.height / 2;
  const ball_radius = 10;
  ball = new Ball(ball_x, ball_y, ball_radius, [player, opponent], canvas);
}

function initPlayers() {
  const player_paddle_x = canvas.width * 0.1;
  const opponent_paddle_x = canvas.width * 0.9;
  const paddle_y = canvas.height / 2 - 50;
  player = new Player(player_paddle_x, paddle_y, 2, 100, canvas, "Player");
  opponent = new Player(opponent_paddle_x, paddle_y, 2, 100, canvas, "Enemy");
}

function drawScores() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "start";
  ctx.fillText("Player1  : " + player.point, 50, 50);
  ctx.textAlign = "end";
  ctx.fillText("Player2: " + opponent.point, canvas.width - 50, 50);
}

function handleKeyboardInput(player) {
  document.onkeydown = function (e) {
    switch (e.keyCode) {
      case 38:
        player.press("up");
        socket.emit("user-input", { action: "up", id: roomId, key: "keydown" });
        break;
      case 40:
        player.press("down");
        socket.emit("user-input", {
          action: "down",
          id: roomId,
          key: "keydown",
        });
        break;
      case 119:
        //keyW
        player.press("up");
        socket.emit("user-input", { action: "up", id: roomId, key: "keydown" });
        break;
      case 115:
        //keyS
        player.press("down");
        socket.emit("user-input", {
          action: "down",
          id: roomId,
          key: "keydown",
        });
        break;
    }
  };
  document.onkeyup = function (e) {
    switch (e.keyCode) {
      case 38:
        player.release("up");
        socket.emit("user-input", { action: "up", id: roomId, key: "keyup" });
        break;
      case 40:
        player.release("down");
        socket.emit("user-input", {
          action: "down",
          id: roomId,
          key: "keyup",
        });
        break;
      case 119:
        //keyW
        player.release("up");
        socket.emit("user-input", { action: "up", id: roomId, key: "keyup" });
        break;
      case 115:
        //keyS
        player.release("down");
        socket.emit("user-input", {
          action: "down",
          id: roomId,
          key: "keyup",
        });
        break;
    }
  };
  window.focus();
}

function update() {
  player.update(); // render player
  opponent.update();
  ball.update();
}

function render() {
  drawBG();
  player.render();
  opponent.render();
  ball.render();
  drawScores(ctx);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop)
}

initPlayers();
initBall();
// gameLoop();
var socket = io();

socket.emit("add-user-active", username);

socket.on("get-user-active", (users) => {
  const html = users.map(
    (item) =>
      `<li class='${
        username === item.username ? "text-red-500" : "text-blue-500"
      } '>${
        item.username === username ? `${item.username} (Me)` : item.username
      }</li>`
  );

  ulUserOnline.innerHTML = html.join("");
  document.querySelector(
    "#count-user-online"
  ).textContent = `(${users.length})`;
});

socket.on("get-room", (data) => {
  gameState = data;

  if (gameState.player1.user.username === username) {
    handleKeyboardInput(player);
  } else {
    handleKeyboardInput(opponent);
  }

  const users = [];
  if (gameState.player1) {
    users.push(gameState.player1.user);
  }

  if (gameState.player2) {
    users.push(gameState.player2.user);
  }
  const html = users.map(
    (item) =>
      `<li class='${
        username === item.username ? "text-red-500" : "text-blue-500"
      } '>${
        item.username === username ? `${item.username} (Me)` : item.username
      }</li>`
  );

  ulUserRoom.innerHTML = html.join("");

  document.querySelector("#count-user-room").textContent = `(${users.length})`;
  renderAction();
});

socket.on("game-update", (state) => {
  player.x = state.player1.x;
  player.y = state.player1.y;
  player.up = state.player1.up;
  player.down = state.player1.down;
  player.point = state.player1.point;
  ball.x = state.ball.x;

  ball.y = state.ball.y;
  ball.xunits = state.ball.xunits;
  ball.yunits = state.ball.yunits;

  opponent.x = state.player2.x;
  opponent.y = state.player2.y;
  opponent.up = state.player2.up;
  opponent.down = state.player2.down;
  opponent.point = state.player2.point;
});

socket.on("game-started", () => {
  playGame();
});

socket.on("error", ({ message }) => {
  swal("Error", message, "error");
});

function playGame() {
  let count = 3;

  function displayCount() {
    isPlaying = true;
    if (count == 0) {
      setTimeout(() => {
        guide.style.display = "none";
        ball.t0 = 0.01
        gameLoop();
      }, 1000);
    }
    textGuide.textContent = count == 0 ? "Ready" : count;
    count--;

    if (count >= 0) {
      setTimeout(displayCount, 1000);
    }
  }

  displayCount();
}

btnPlay.onclick = () => {
  !isPlaying && socket.emit("game-start", { id: roomId });
};

btnCreateRoom.onclick = () => {
  roomId = Math.floor(Math.random() * 1000) + 1;
  socket.emit("create-room", { id: roomId });
};

btnJoinRoom.onclick = () => {
  const valueRoomId = inputRoom.value;
  if (valueRoomId.trim().length > 0) {
    socket.emit("join-room", { id: valueRoomId });
    roomId = +valueRoomId;
  }
};
