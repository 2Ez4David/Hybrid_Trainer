// --- ANTIGRAVITY PARTICLE ENGINE (v2 — Performance Optimized) ---
const canvas = document.getElementById('antigravity-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let mouse = { x: null, y: null, radius: 100 };
let gyro = { vx: 0, vy: 0, active: false };

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); });
window.addEventListener('mousemove', (event) => { mouse.x = event.x; mouse.y = event.y; });
window.addEventListener('touchmove', (event) => { mouse.x = event.touches[0].clientX; mouse.y = event.touches[0].clientY; }, { passive: true });
window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
window.addEventListener('touchend', () => { mouse.x = undefined; mouse.y = undefined; });

class Particle {
    constructor(x, y, size, speedY) {
        this.x = x; this.y = y; this.size = size;
        this.speedY = speedY;
        this.speedX = (Math.random() - 0.5) * 0.08;
        this.vx = 0;
        this.vy = 0;
        this.opacity = Math.random() * 0.35 + 0.1;
        this.hue = Math.random() * 60 + 200;
        // Pre-compute color strings for performance (avoid per-frame string allocation)
        const alpha = this.opacity;
        this.colorDark = `hsla(${this.hue}, 80%, 70%, ${(alpha * 1.6).toFixed(3)})`;
        this.colorLight = `hsla(${this.hue}, 75%, 55%, ${alpha.toFixed(3)})`;
        this.glowDark = `hsla(${this.hue}, 80%, 70%, ${(alpha * 0.12).toFixed(3)})`;
        this.glowLight = `hsla(${this.hue}, 75%, 55%, ${(alpha * 0.12).toFixed(3)})`;
        this.hasGlow = this.size > 2.5;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = state.darkMode ? this.colorDark : this.colorLight;
        ctx.fill();
        if (this.hasGlow) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = state.darkMode ? this.glowDark : this.glowLight;
            ctx.fill();
        }
    }
    update() {
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.x += this.speedX + this.vx + gyro.vx;
        this.y -= this.speedY;
        this.y += this.vy + gyro.vy;
        // Wrap around
        if (this.y < 0 - this.size) { this.y = canvas.height + this.size; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        // Mouse repel
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < mouse.radius * mouse.radius) {
                let distance = Math.sqrt(distSq);
                const force = (mouse.radius - distance) / mouse.radius;
                this.vx -= (dx / distance) * force * 1.2;
                this.vy -= (dy / distance) * force * 1.2;
            }
        }
        this.draw();
    }
}

function initParticles() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    particlesArray = [];
    // Much fewer particles — performance friendly for mobile
    const numberOfParticles = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000));
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 3.5) + 0.5;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let speedY = (Math.random() * 0.12) + 0.02;
        particlesArray.push(new Particle(x, y, size, speedY));
    }
}

let lastFrame = 0;
const targetInterval = 1000 / 30; // Cap at 30 FPS for battery savings

function animateParticles(timestamp) {
    if (state.user.particlesEnabled === false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        requestAnimationFrame(animateParticles);
        return;
    }
    canvas.style.display = '';

    // Throttle to ~30fps
    const delta = timestamp - lastFrame;
    if (delta < targetInterval) {
        requestAnimationFrame(animateParticles);
        return;
    }
    lastFrame = timestamp - (delta % targetInterval);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
    // No connection lines — clean & performant
    requestAnimationFrame(animateParticles);
}

function initGyro() {
    if (gyro.active) return;

    const handleOrientation = (event) => {
        let x = event.gamma; // In degree in the range [-90,90]
        let y = event.beta;  // In degree in the range [-180,180]

        if (x === null || y === null) return;

        // Limit values
        if (x > 90) x = 90;
        if (x < -90) x = -90;
        if (y > 90) y = 90;
        if (y < -90) y = -90;

        // Tilt modifiers - tilt right (gamma > 0) -> move particles left for parallax effect
        // Tweak multiplier to adjust sensitivity
        gyro.vx = -x * 0.04;
        gyro.vy = -y * 0.04;
    };

    const enableGyro = () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        gyro.active = true;
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
            gyro.active = true;
        }

        document.removeEventListener('click', enableGyro);
        document.removeEventListener('touchend', enableGyro);
    };

    // Require user interaction to prompt for permission (iOS 13+ requirement)
    // Avoid using 'touchstart', since Safari iOS might not consider it a deliberate user gesture
    // (could be the start of a scroll), which blocks `requestPermission()`.
    document.addEventListener('click', enableGyro, { once: true });
    document.addEventListener('touchend', enableGyro, { once: true });
}
