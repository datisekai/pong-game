class Game {
  constructor(id, io, canvas) {
    this.id = id;
    this.io = io;
    this.isPlaying = false;
    //TODO
    this.gameState = {};
    this.ballDefault = {};
    this.canvas = canvas;
    setInterval(() => {
      if (this.isPlaying) {
        this.updateBall();
        this.updatePlayer('player1')
        this.updatePlayer('player2')
        io.to(this.gameState.player1.user.socketId).emit(
          "game-update",
          this.gameState
        );
        io.to(this.gameState.player2.user.socketId).emit(
          "game-update",
          this.gameState
        );
      }
    }, 16.67);
  }

  resetBall() {
    this.gameState.ball = { ...this.ballDefault };
  }

  collisionWith(player) {
    // Too high or too low: Cannot collision
    if (
      this.gameState.ball.y >
        this.gameState[player].y + this.gameState[player].height ||
      this.gameState.ball.y < this.gameState[player].y
    ) {
      return false;
    }
    // Collision from left side of this.gameState[player]
    if (
      this.gameState.ball.x + this.gameState.ball.radius >
        this.gameState[player].x &&
      this.gameState.ball.x - this.gameState.ball.radius <
        this.gameState[player].x &&
      this.gameState.ball.xunits > 0
    ) {
      return true;
    }
    // Collision from right side of this.gameState[player]
    if (
      this.gameState.ball.x - this.gameState.ball.radius <
        this.gameState[player].x + this.gameState[player].width &&
      this.gameState.ball.x + this.gameState.ball.radius >
        this.gameState[player].x + this.gameState[player].width &&
      this.gameState.ball.xunits < 0
    ) {
      return true;
    }
    // Else: No conllision
    return false;
  }

  getDelta(player) {
    const MAX_DELTA_Y = 3;
    const MAX_DISTANCE = this.gameState[player].height / 2;
    const distance =
      this.gameState.ball.y - (this.gameState[player].y + MAX_DISTANCE);
    return Math.floor((distance / MAX_DISTANCE) * MAX_DELTA_Y);
  }

  updatePlayer(player) {
    if (this.gameState[player].up) {
      if (this.gameState[player].y > 0)
        this.gameState[player].y -= this.gameState[player].speed;
    } else if (this.gameState[player].down) {
      if (this.gameState[player].y < this.canvas.height - 100)
        this.gameState[player].y += this.gameState[player].speed;
    }
  }

  updateBall() {
    if (
      this.gameState.ball.y + this.gameState.ball.radius >=
        this.canvas.height ||
      this.gameState.ball.y - this.gameState.ball.radius <= 0
    ) {
      this.gameState.ball.yunits = -this.gameState.ball.yunits;
    }

    if (this.gameState.ball.x + this.gameState.ball.radius > this.canvas.width) {
      this.gameState.player1.point++;
      this.resetBall();
      return;
    }

    if (this.gameState.ball.x < this.gameState.ball.radius) {
      this.resetBall();
      this.gameState.player2.point++;
      return;
    }

    ["player1", "player2"].forEach((player) => {
      if (this.collisionWith(player)) {
        this.gameState.ball.xunits = -this.gameState.ball.xunits;
        this.gameState.ball.yunits += this.getDelta(player);
      }
    });


    this.gameState.ball.x +=
      this.gameState.ball.xunits * this.gameState.ball.speed;
    this.gameState.ball.y +=
      this.gameState.ball.yunits * this.gameState.ball.speed;
  }
}

const repo = {};

function isRoom(id) {
  if (repo[id]) {
    return true;
  }
  return false;
}

function gameGetById(id, io, canvas) {
  if (!repo[id]) {
    repo[id] = new Game(id, io, canvas);
  }
  return repo[id];
}

module.exports = {
  gameGetById,
  Game,
  isRoom,
};
