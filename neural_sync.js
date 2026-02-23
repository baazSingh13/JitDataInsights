class NeuralSyncAnimation {
    constructor() {
        this.canvas = document.getElementById('sync-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.signals = [];
        this.mcus = [];
        this.brainParticles = [];
        this.brainPos = { x: 0, y: 0 };
        this.angle = 0;

        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    init() {
        this.resize();
        this.createBrain();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.brainPos = { x: this.width / 2, y: this.height / 2 };
        this.createCores();
    }

    createBrain() {
        this.brainParticles = [];
        const particleCount = 200;
        for (let i = 0; i < particleCount; i++) {
            this.brainParticles.push({
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.4) * 60, // Slightly oval
                z: (Math.random() - 0.5) * 40,
                size: Math.random() * 2 + 1,
                speed: 0.02 + Math.random() * 0.05,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createCores() {
        this.mcus = [];
        const mcuCount = 100;
        const pinsPerMCU = 10; // Reducing pins per mcu for performance while maintaining "thousands" feel via frequency
        const radius = Math.min(this.width, this.height) * 0.4;

        for (let i = 0; i < mcuCount; i++) {
            const theta = (i / mcuCount) * Math.PI * 2;
            const x = this.brainPos.x + Math.cos(theta) * radius;
            const y = this.brainPos.y + Math.sin(theta) * radius;

            const pins = [];
            for (let j = 0; j < pinsPerMCU; j++) {
                pins.push({
                    angle: theta + (Math.random() - 0.5) * 0.1,
                    dist: radius + (Math.random() - 0.5) * 20
                });
            }
            this.mcus.push({ x, y, theta, pins });
        }
    }

    spawnSignal() {
        if (this.mcus.length === 0) return;
        const mcu = this.mcus[Math.floor(Math.random() * this.mcus.length)];
        const theta = mcu.theta;
        const startRadius = Math.min(this.width, this.height) * 0.4;

        // Manhattan-style radial path
        const path = [
            { r: startRadius, t: theta },
            { r: startRadius * (0.6 + Math.random() * 0.2), t: theta },
            { r: startRadius * (0.4 + Math.random() * 0.2), t: theta + (Math.random() - 0.5) * 0.5 },
            { r: 0, t: theta + (Math.random() - 0.5) * 0.2 }
        ];

        this.signals.push({
            path,
            progress: 0,
            speed: 0.008 + Math.random() * 0.012,
            width: 0.5 + Math.random() * 1.5,
            color: `rgba(0, 240, 255, ${0.4 + Math.random() * 0.6})`
        });
    }

    drawBrain() {
        const time = Date.now() * 0.001;
        this.ctx.save();
        this.ctx.translate(this.brainPos.x, this.brainPos.y);

        // Draw connections between brain particles
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.brainParticles.length; i += 4) {
            const p1 = this.brainParticles[i];
            const p2 = this.brainParticles[(i + 1) % this.brainParticles.length];
            const offset = Math.sin(time + p1.phase) * 5;
            this.ctx.moveTo(p1.x, p1.y + offset);
            this.ctx.lineTo(p2.x, p2.y - offset);
        }
        this.ctx.stroke();

        this.brainParticles.forEach(p => {
            const glow = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 240, 255, ${0.2 + glow * 0.8})`;
            const yOffset = Math.sin(time + p.phase) * 5;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y + yOffset, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (glow > 0.8) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.restore();
    }

    drawCores() {
        this.mcus.forEach(mcu => {
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            this.ctx.fillRect(mcu.x - 3, mcu.y - 3, 6, 6);

            // Pulsing pin activity
            if (Math.random() > 0.95) {
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.fillRect(mcu.x - 2, mcu.y - 2, 4, 4);
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.strokeRect(mcu.x - 5, mcu.y - 5, 10, 10);
                this.ctx.shadowBlur = 0;
            }
        });
    }

    drawSignals() {
        this.signals.forEach((sig, index) => {
            sig.progress += sig.speed;
            if (sig.progress >= 1) {
                this.signals.splice(index, 1);
                return;
            }

            const segmentCount = sig.path.length - 1;
            const absProgress = sig.progress * segmentCount;
            const currentSeg = Math.floor(absProgress);
            const segProgress = absProgress - currentSeg;

            const p1 = sig.path[currentSeg];
            const p2 = sig.path[currentSeg + 1];

            const curR = p1.r + (p2.r - p1.r) * segProgress;
            const curT = p1.t + (p2.t - p1.t) * segProgress;

            const x = this.brainPos.x + Math.cos(curT) * curR;
            const y = this.brainPos.y + Math.sin(curT) * curR;

            // Draw full track path (very subtle)
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
            this.ctx.lineWidth = 0.5;
            let tx = this.brainPos.x + Math.cos(sig.path[0].t) * sig.path[0].r;
            let ty = this.brainPos.y + Math.sin(sig.path[0].t) * sig.path[0].r;
            this.ctx.moveTo(tx, ty);
            for (let i = 1; i < sig.path.length; i++) {
                let px = this.brainPos.x + Math.cos(sig.path[i].t) * sig.path[i].r;
                let py = this.brainPos.y + Math.sin(sig.path[i].t) * sig.path[i].r;
                this.ctx.lineTo(px, py);
            }
            this.ctx.stroke();

            // Draw signal head
            this.ctx.beginPath();
            this.ctx.strokeStyle = sig.color;
            this.ctx.lineWidth = sig.width;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = sig.color;

            const prevProgress = Math.max(0, segProgress - 0.1);
            const prevX = this.brainPos.x + Math.cos(p1.t + (p2.t - p1.t) * prevProgress) * (p1.r + (p2.r - p1.r) * prevProgress);
            const prevY = this.brainPos.y + Math.sin(p1.t + (p2.t - p1.t) * prevProgress) * (p1.r + (p2.r - p1.r) * prevProgress);

            this.ctx.moveTo(x, y);
            this.ctx.lineTo(prevX, prevY);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.signals.length < 150) {
            for (let i = 0; i < 4; i++) this.spawnSignal();
        }

        this.drawBrain();
        this.drawCores();
        this.drawSignals();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralSyncAnimation();
});
