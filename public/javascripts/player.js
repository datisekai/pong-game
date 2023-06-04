
class Player {
    constructor(x, y, width, height, canvas, name) {
      this.x = x;
      this.y = y;
      this.name = name;
      this.height = height;
      this.width = width;
      this.ctx = ctx;
      this.speed = 5;
      this.point = 0;
  
      this.up = false;
      this.down = false;
      this.innerColor = "#ffffff";
      this.outerColor = "#ffffff";
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }
    changeCoords(x, y) {
      this.x = x;
      this.y = y;
    }
  
    update() {
      if (this.up) {
          if (this.y > 0) this.y -= this.speed;
      } else if (this.down) {
          if (this.y < canvas.height - 100) this.y += this.speed;
      }
    }
  
    render() { 
      // console.log(`${this.name}.render() called`);
      let ctx = this.ctx;
      ctx.beginPath();
      ctx.fillStyle = this.innerColor;
      ctx.strokeStyle = this.outerColor;
  
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.fill();
    }
    press(dir) {
      switch (dir) {
        case "down":
          this.down = true;
          break;
        case "up":
          this.up = true;
          break;
      }
    }
    release(dir) {
      switch (dir) {
          case "down":
            this.down = false;
            break;
          case "up":
            this.up = false;
            break;
      } 
    }
  }
  