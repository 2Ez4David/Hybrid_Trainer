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
        this.z = Math.random(); // Depth 0 (back) to 1 (front)

        // Classic settings
        this.opacity = (Math.random() * 0.2 + 0.1) * (0.5 + this.z * 0.5); // Softer opacity
        this.hue = Math.random() * 60 + 200;

        // String settings
        this.wobbleAngle = Math.random() * Math.PI * 2; // For wobbly motion
        this.wobbleSpeed = (Math.random() * 0.05) + 0.02;
        this.currentAngle = Math.random() * Math.PI * 2; // Iron filing angle
        this.targetAngle = this.currentAngle;
        this.baseLength = Math.floor(Math.random() * 8) + 4; // Much shorter lines
        // Pre-compute color strings for performance (avoid per-frame string allocation)
        const alpha = this.opacity;
        this.colorDark = `hsla(${this.hue}, 80%, 70%, ${(alpha * 1.6).toFixed(3)})`;
        this.colorLight = `hsla(${this.hue}, 75%, 55%, ${alpha.toFixed(3)})`;
        this.glowDark = `hsla(${this.hue}, 80%, 70%, ${(alpha * 0.12).toFixed(3)})`;
        this.glowLight = `hsla(${this.hue}, 75%, 55%, ${(alpha * 0.12).toFixed(3)})`;
        this.hasGlow = this.size > 2.5;
    }
    draw() {
        const isString = state.user && state.user.particleStyle === 'strings';
        ctx.beginPath();

        if (isString) {
            // Draw magnetic stroke (iron filing)
            let len = this.baseLength * (0.5 + this.z); // Depth affects length length

            // Wobble the tip slightly
            let wx = Math.sin(this.wobbleAngle) * 4 * this.z;
            let wy = Math.cos(this.wobbleAngle) * 4 * this.z;

            let endX = this.x + Math.cos(this.currentAngle) * len + wx;
            let endY = this.y + Math.sin(this.currentAngle) * len + wy;

            // Draw curved stroke
            let cx = this.x + Math.cos(this.currentAngle) * (len * 0.5) - wy * 0.5;
            let cy = this.y + Math.sin(this.currentAngle) * (len * 0.5) + wx * 0.5;

            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(cx, cy, endX, endY);

            ctx.strokeStyle = state.darkMode ? this.colorDark : this.colorLight;
            ctx.lineWidth = this.size * (0.8 + this.z * 1.5);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            if (this.hasGlow) {
                ctx.lineWidth = this.size * (1.5 + this.z * 2);
                ctx.strokeStyle = state.darkMode ? this.glowDark : this.glowLight;
                ctx.stroke();
            }
        } else {
            // Classic mode: only circles
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
    }
    update(allParticles) {
        const isString = state.user && state.user.particleStyle === 'strings';

        if (isString) {
            // High inertia (takes 1-2 seconds to come to rest)
            this.vx *= 0.96;
            this.vy *= 0.96;

            this.wobbleAngle += this.wobbleSpeed;

            let influenceRadius = canvas.width * 0.9; // 90% screen width

            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < influenceRadius) {
                    this.targetAngle = Math.atan2(dy, dx);

                    let coreRadius = 140; // Very large mouse pointer effect
                    if (dist < coreRadius) {
                        // Repel gently from the core so they stay in a ring
                        let centerPush = Math.pow((coreRadius - dist) / coreRadius, 2);
                        this.vx -= (dx / dist) * centerPush * 0.3 * (0.5 + this.z); // Softer repel
                        this.vy -= (dy / dist) * centerPush * 0.3 * (0.5 + this.z);
                    } else {
                        // Slow, gentle magnetic pull inwards
                        let pullForce = Math.pow((influenceRadius - dist) / influenceRadius, 2);
                        this.vx += (dx / dist) * pullForce * 0.15 * (0.5 + this.z); // Softer pull
                        this.vy += (dy / dist) * pullForce * 0.15 * (0.5 + this.z);
                    }
                } else {
                    // Idle angle tracking velocity
                    if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                        this.targetAngle = Math.atan2(this.vy, this.vx);
                    }
                }
            } else {
                if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                    this.targetAngle = Math.atan2(this.vy, this.vx);
                } else {
                    this.targetAngle = -Math.PI / 4;
                }
            }

            // Gyro forces
            let gx = gyro.vx * 8 * this.z; // Softer gyro
            let gy = gyro.vy * 8 * this.z;
            this.vx += gx * 0.1;
            this.vy += gy * 0.1;

            // Interpolate angular rotation smoothly (high viscosity visual turning)
            let angleDiff = this.targetAngle - this.currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.currentAngle += angleDiff * 0.03;

            // Constantly squirm around (adds to velocity)
            let wx = Math.sin(this.wobbleAngle) * 0.05 * this.z; // Softer wobble
            let wy = Math.cos(this.wobbleAngle) * 0.05 * this.z;
            this.vx += wx;
            this.vy += wy;

            // Limit maximum velocity for slow creeping feel
            let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            let maxSpeed = 1.2; // Severely lower max speed so they don't sprint
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }

            // Inter-Particle Repulsion (Preventing clumping into a single dot)
            if (allParticles) {
                // Massive repulsion radius to keep them extremely far apart
                let repulsionRadius = this.baseLength * 9.5;
                for (let i = 0; i < allParticles.length; i++) {
                    let p2 = allParticles[i];
                    if (this === p2) continue; // Skip self

                    let dx = p2.x - this.x;
                    let dy = p2.y - this.y;
                    let distSq = dx * dx + dy * dy;

                    if (distSq < repulsionRadius * repulsionRadius && distSq > 0) {
                        let dist = Math.sqrt(distSq);
                        let force = (repulsionRadius - dist) / repulsionRadius;
                        // Push away gently due to high inertia accumulation
                        this.vx -= (dx / dist) * force * 0.4;
                        this.vy -= (dy / dist) * force * 0.4;
                    }
                }
            }

            // Update physical position
            this.x += this.vx;
            this.y += this.vy;

            // Screen Wrap (free floating logic)
            let margin = this.baseLength * 2;
            if (this.y < 0 - margin) { this.y = canvas.height + margin; this.x = Math.random() * canvas.width; }
            if (this.y > canvas.height + margin) { this.y = -margin; this.x = Math.random() * canvas.width; }
            if (this.x < -margin) { this.x = canvas.width + margin; }
            if (this.x > canvas.width + margin) { this.x = -margin; }

        } else {
            // --- Classic Flowing Mode ---
            this.vx *= 0.94;
            this.vy *= 0.94;

            let gx = gyro.vx * (0.5 + this.z);
            let gy = gyro.vy * (0.5 + this.z);

            // Apply flowing movement
            this.x += this.speedX + this.vx + gx;
            this.y -= this.speedY; // Natural rising
            this.y += this.vy + gy;

            // Wrap around screen
            let margin = this.size * 15;
            if (this.y < 0 - margin) { this.y = canvas.height + margin; this.x = Math.random() * canvas.width; }
            if (this.y > canvas.height + margin) { this.y = -margin; this.x = Math.random() * canvas.width; }
            if (this.x < -margin) { this.x = canvas.width + margin; }
            if (this.x > canvas.width + margin) { this.x = -margin; }

            // Classic Point Repulsion
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.vx -= (dx / distance) * force * 1.2;
                    this.vy -= (dy / distance) * force * 1.2;
                }
            }
        }

        this.draw();
    }
}

function initParticles() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    particlesArray = [];

    let isString = state.user && state.user.particleStyle === 'strings';
    // Substantially reduce particle count for strings to make it much less distracting
    let countDivider = isString ? 20000 : 8000;

    // Much fewer particles — performance friendly for mobile
    const numberOfParticles = Math.min(120, Math.floor((canvas.width * canvas.height) / countDivider));
    for (let i = 0; i < numberOfParticles; i++) {
        let size = isString ? (Math.random() * 1.5) + 0.5 : (Math.random() * 3.5) + 0.5; // Strings are thinner
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
    for (let i = 0; i < particlesArray.length; i++) {
        // Pass particlesArray to allow for inter-particle calculations
        particlesArray[i].update(particlesArray);
    }
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

        // Tilt modifiers
        // Inverted calculation so tilting phone down moves particles down
        gyro.vx = x * 0.04;
        gyro.vy = y * 0.04;
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
