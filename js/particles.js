// --- ANTIGRAVITY PARTICLE ENGINE ---
const canvas = document.getElementById('antigravity-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let mouse = { x: null, y: null, radius: 100 };
let gyro = { x: 0, y: 0 };

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); });
window.addEventListener('mousemove', (event) => { mouse.x = event.x; mouse.y = event.y; });
window.addEventListener('touchmove', (event) => { mouse.x = event.touches[0].clientX; mouse.y = event.touches[0].clientY; }, { passive: true });
window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
window.addEventListener('touchend', () => { mouse.x = undefined; mouse.y = undefined; });

function initGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(p => {
            if (p === 'granted') window.addEventListener('deviceorientation', handleGyro, true);
        }).catch(() => { });
    } else {
        window.addEventListener('deviceorientation', handleGyro, true);
    }
}
function handleGyro(e) {
    gyro.x = (e.gamma || 0) / 45;
    gyro.y = (e.beta || 0) / 45;
}

class Particle {
    constructor(x, y, size, speedY) {
        this.x = x; this.y = y; this.size = size;
        this.baseX = this.x; this.baseY = this.y;
        this.speedY = speedY;
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.vx = 0;
        this.vy = 0;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() * 60 + 200;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const alpha = this.opacity;
        ctx.fillStyle = state.darkMode
            ? `hsla(${this.hue}, 80%, 70%, ${alpha * 1.6})`
            : `hsla(${this.hue}, 75%, 55%, ${alpha * 1.0})`;
        ctx.fill();
        if (this.size > 2) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = state.darkMode
                ? `hsla(${this.hue}, 80%, 70%, ${alpha * 0.15})`
                : `hsla(${this.hue}, 75%, 55%, ${alpha * 0.15})`;
            ctx.fill();
        }
    }
    update() {
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.speedX + this.vx;
        this.y -= this.speedY;
        this.y += this.vy;
        this.vx += gyro.x * 0.3;
        this.vy += gyro.y * 0.15;
        if (this.y < 0 - this.size) { this.y = canvas.height + this.size; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                this.vx -= forceDirectionX * force * 1.2;
                this.vy -= forceDirectionY * force * 1.2;
            }
        }
        this.draw();
    }
}

function initParticles() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    particlesArray = [];
    const numberOfParticles = Math.min(500, Math.floor((canvas.width * canvas.height) / 3000));
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 4) + 0.5;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let speedY = (Math.random() * 0.15) + 0.03;
        particlesArray.push(new Particle(x, y, size, speedY));
    }
}

function connectParticles() {
    const maxDist = 70;
    const minDist = 20;
    const maxConnections = 3;
    const connectionCount = new Uint8Array(particlesArray.length);
    for (let a = 0; a < particlesArray.length; a++) {
        if (connectionCount[a] >= maxConnections) continue;
        for (let b = a + 1; b < particlesArray.length; b++) {
            if (connectionCount[b] >= maxConnections) continue;
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist * minDist || dist > maxDist * maxDist) continue;
            if (mouse.x != null) {
                const mxA = particlesArray[a].x - mouse.x;
                const myA = particlesArray[a].y - mouse.y;
                const mxB = particlesArray[b].x - mouse.x;
                const myB = particlesArray[b].y - mouse.y;
                const repelDistSq = (mouse.radius * 1.2) * (mouse.radius * 1.2);
                if ((mxA * mxA + myA * myA) < repelDistSq || (mxB * mxB + myB * myB) < repelDistSq) {
                    continue;
                }
            }
            const opacity = 1 - (Math.sqrt(dist) / maxDist);
            ctx.strokeStyle = state.darkMode
                ? `rgba(96, 165, 250, ${opacity * 0.1})`
                : `rgba(59, 130, 246, ${opacity * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
            connectionCount[a]++;
            connectionCount[b]++;
        }
    }
}

function animateParticles() {
    if (state.user.particlesEnabled === false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        requestAnimationFrame(animateParticles);
        return;
    }
    canvas.style.display = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
    connectParticles();
    requestAnimationFrame(animateParticles);
}

