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
    this.draw();

    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
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
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const firstPlayer = new Player(canvasCenterX, canvasCenterY, 15, "white");

const projectiles = [];
const enemies = [];

function spawnEnemies() {
  setInterval(() => {
    // 20 is the minimum size of the enemy
    // so this line will make sure that we only get a value between 20 and 40
    const radius = Math.random() * (40 - 20) + 20;
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width - radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height - radius;
    }

    const color = `hsl(${Math.random() * 360},60%,50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  firstPlayer.draw();

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update(5);

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update(1);

    const distance = Math.hypot(
      firstPlayer.x - enemy.x,
      firstPlayer.y - enemy.y
    );
    if (Math.round(distance - enemy.radius - firstPlayer.radius) < 1) {
      firstPlayer.color = "red";
      setTimeout(() => {
        cancelAnimationFrame(animationId);
      }, 50);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      if (Math.round(distance - enemy.radius - projectile.radius) < 1) {
        setTimeout(() => {
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });
  });
}

window.addEventListener("click", (e) => {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };

  // this to shoot another projectile in a slightly different angle
  // const velocity2 = {
  //   x: Math.cos(angle) + 0.015,
  //   y: Math.sin(angle) + 0.15,
  // };
  // const velocity3 = {
  //   x: Math.cos(angle) + 0.15,
  //   y: Math.sin(angle) + 0.15,
  // };
  projectiles.push(
    new Projectile(canvasCenterX, canvasCenterY, 5, "white", velocity)
    // new Projectile(canvasCenterX, canvasCenterY, 5, "blue", velocity2),
    // new Projectile(canvasCenterX, canvasCenterY, 5, "blue", velocity3)
  );
});

spawnEnemies();
animate();
