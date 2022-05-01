const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasCenterX = canvas.width / 2;
const canvasCenterY = canvas.height / 2;

const ctx = canvas.getContext("2d");

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = velocity;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const firstPlayer = new Player(canvasCenterX, canvasCenterY, 50, "cyan");
firstPlayer.draw();
const projectile = new Projectile(
  canvasCenterX,
  canvasCenterY,
  firstPlayer.radius / 2,
  "red",
  { x: -1.5, y: -1.5 }
);
function animate() {
  requestAnimationFrame(animate);
  projectile.draw();
  projectile.update();
}

window.addEventListener("click", (e) => {
  animate();
});
