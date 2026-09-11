const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const fireworks = [];
const particles = [];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

class Firework {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = Math.hypot(targetX - startX, targetY - startY);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(targetY - startY, targetX - startX);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        this.hue = random(0, 360);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;

        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.hypot((this.x + vx) - this.x, (this.y + vy) - this.y);

        if (this.speed >= this.distanceToTarget) {
            createParticles(this.targetX, this.targetY, this.hue);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
            this.distanceToTarget -= this.speed;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function createParticles(x, y, hue) {
    let particleCount = 80;
    while (particleCount--) {
        particles.push(new Particle(x, y, hue));
    }
}
function loop() {
    requestAnimationFrame(loop);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }
    if (Math.random() < 0.04 && fireworks.length < 5) {
        fireworks.push(new Firework(
            random(0, canvas.width),
            canvas.height,
            random(0, canvas.width),
            random(0, canvas.height / 2)
        ));
    }
}
window.addEventListener('mousedown', (e) => {
    fireworks.push(new Firework(
        canvas.width / 2,
        canvas.height,
        e.clientX,
        e.clientY
    ));
});

loop();
