class Ball {
  constructor(x, y, radius, players, canvas) {
    this.x = this.x0 = x;
    this.y = this.y0 = y;
    this.radius = radius;
    this.speed = this.speed0 = 5;

    this.xunits = this.xunits0 = 1;
    this.yunits = this.yunits0 = 0;
    this.players = players;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  reset() {
    this.x = this.x0;
    this.y = this.y0;
    this.xunits = this.xunits0;
    this.yunits = this.yunits0;
    this.speed = this.speed0;
  }

  update() {
    if (
      this.y + this.radius >= this.canvas.height ||
      this.y - this.radius <= 0
    ) {
      this.yunits = -this.yunits;
    }

    if (this.x > this.canvas.width) {
      player.point++;
      this.reset();
      return;
    }

    if (this.x < 0) {
      this.reset();
      opponent.point++;
      return;
    }

    //if player paddle collision
    for (let player of this.players) {
      if (this.collisionWith(player)) {
        this.xunits = -this.xunits;
        this.yunits += this.getDelta(player);
      }
    }

    this.x += this.xunits * this.speed;
    this.y += this.yunits * this.speed;
  }

  getDelta(player) {
    const MAX_DELTA_Y = 3;
    const MAX_DISTANCE = player.height / 2;
    const distance = this.y - (player.y + player.height / 2);
    return Math.floor((distance / MAX_DISTANCE) * MAX_DELTA_Y);
  }

  collisionWith(player) {
    // Too high or too low: Cannot collision
    if (this.y > player.y + player.height || this.y < player.y) {
      return false;
    }
    // Collision from left side of player
    if (
      this.x + this.radius > player.x &&
      this.x - this.radius < player.x &&
      this.xunits > 0
    ) {
      return true;
    }
    // Collision from right side of player
    if (
      this.x - this.radius < player.x + player.width &&
      this.x + this.radius > player.x + player.width &&
      this.xunits < 0
    ) {
      return true;
    }
    // Else: No conllision
    return false;
  }

  render() {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#ffffff";
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.save();
    ctx.shadowColor = "#999";
    ctx.fill();
    ctx.stroke();
  }
}
