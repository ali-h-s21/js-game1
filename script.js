const canvas = document.querySelector("canvas");
const scoreBox = document.querySelector(".score-box");
const score = document.getElementById("score");
const restartModal = document.querySelector(".restart-modal");
const finalScore = document.getElementById("final-score");
const startBtn = document.getElementById("start-game-btn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasCenterX = canvas.width / 2;
const canvasCenterY = canvas.height / 2;
const friction = 0.98;
let projectiles = [];
let enemies = [];
let particles = [];

const ctx = canvas.getContext("2d");
let enemiesInterval;

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

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = velocity;
    this.color = color;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const firstPlayer = new Player(canvasCenterX, canvasCenterY, 15, "white");

function spawnEnemies() {
  enemiesInterval = setInterval(() => {
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

  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

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
    // enemy hit the player => end the game
    if (Math.round(distance - enemy.radius - firstPlayer.radius) < 1) {
      restartModal.classList.remove("hide");
      scoreBox.classList.add("hide");
      finalScore.innerText = score.innerText;
      score.innerText = "0";
      enemies = [];
      projectiles = [];
      particles = [];
      clearInterval(enemiesInterval);
      setTimeout(() => {
        cancelAnimationFrame(animationId);
      }, 50);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      // projecile hit enemy
      if (Math.round(distance - enemy.radius - projectile.radius) < 1) {
        for (let i = 0; i < enemy.radius; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5),
              }
            )
          );
        }
        if (enemy.radius - 15 > 10) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else if (enemy.radius - 15 < 10) {
          score.innerText = Math.floor(Number(score.innerText) + enemy.radius);
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
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
  const velocity2 = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4.5,
  };
  const velocity3 = {
    x: Math.cos(angle) * 3,
    y: Math.sin(angle) * 3.5,
  };
  projectiles.push(
    new Projectile(canvasCenterX, canvasCenterY, 5, "white", velocity),
    new Projectile(canvasCenterX, canvasCenterY, 5, "white", velocity2),
    new Projectile(canvasCenterX, canvasCenterY, 5, "white", velocity3)
  );
});

startBtn.addEventListener("click", () => {
  restartModal.classList.add("hide");
  scoreBox.classList.remove("hide");
  spawnEnemies();
  animate();
});
