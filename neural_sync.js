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
        const particleCount = 350; // Increased density for larger scale
        for (let i = 0; i < particleCount; i++) {
            this.brainParticles.push({
                x: (Math.random() - 0.5) * 450, // Massive spread
                y: (Math.random() - 0.4) * 350,
                z: (Math.random() - 0.5) * 120,
                size: Math.random() * 6.5 + 3.5, // Massive particles
                speed: 0.01 + Math.random() * 0.03,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createCores() {
        this.mcus = [];
        const mcuCount = 140; // More MCUs for the bigger grid
        const pinsPerMCU = 10;
        // Pushing cores further to the edges, considering the 100vw container
        const radius = Math.max(this.width, this.height) * 0.85;

        for (let i = 0; i < mcuCount; i++) {
            const theta = (i / mcuCount) * Math.PI * 2;
            const x = this.brainPos.x + Math.cos(theta) * radius;
            const y = this.brainPos.y + Math.sin(theta) * radius;

            const pins = [];
            for (let j = 0; j < pinsPerMCU; j++) {
                pins.push({
                    angle: theta + (Math.random() - 0.5) * 0.1,
                    dist: radius + (Math.random() - 0.5) * 40
                });
            }
            this.mcus.push({ x, y, theta, pins });
        }
    }

    spawnSignal() {
        if (this.mcus.length === 0) return;
        const mcu = this.mcus[Math.floor(Math.random() * this.mcus.length)];
        const theta = mcu.theta;
        const startRadius = Math.max(this.width, this.height) * 0.85;

        // Manhattan-style radial path
        const path = [
            { r: startRadius, t: theta },
            { r: startRadius * (0.6 + Math.random() * 0.2), t: theta },
            { r: startRadius * (0.3 + Math.random() * 0.2), t: theta + (Math.random() - 0.5) * 0.8 },
            { r: 0, t: theta + (Math.random() - 0.5) * 0.3 }
        ];

        this.signals.push({
            path,
            progress: 0,
            speed: 0.005 + Math.random() * 0.01, // Slower for epic feel
            width: 3.5 + Math.random() * 5.5, // Very thick signals
            color: `rgba(0, 240, 255, ${0.4 + Math.random() * 0.6})`
        });
    }

    drawBrain() {
        const time = Date.now() * 0.001;
        this.ctx.save();
        this.ctx.translate(this.brainPos.x, this.brainPos.y);

        // Draw connections between brain particles
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        this.ctx.lineWidth = 1.2;
        for (let i = 0; i < this.brainParticles.length; i += 3) {
            const p1 = this.brainParticles[i];
            const p2 = this.brainParticles[(i + 1) % this.brainParticles.length];
            const offset = Math.sin(time + p1.phase) * 12;
            this.ctx.moveTo(p1.x, p1.y + offset);
            this.ctx.lineTo(p2.x, p2.y - offset);
        }
        this.ctx.stroke();

        this.brainParticles.forEach(p => {
            const glow = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 240, 255, ${0.3 + glow * 0.7})`;
            const yOffset = Math.sin(time + p.phase) * 12;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y + yOffset, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (glow > 0.8) {
                this.ctx.shadowBlur = 35; // Massive glow
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.restore();
    }

    drawCores() {
        this.mcus.forEach(mcu => {
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
            this.ctx.fillRect(mcu.x - 8, mcu.y - 8, 16, 16); // Massive MCU body

            // Pulsing pin activity
            if (Math.random() > 0.9) {
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.fillRect(mcu.x - 5, mcu.y - 5, 10, 10);
                this.ctx.shadowBlur = 18;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.strokeRect(mcu.x - 12, mcu.y - 12, 24, 24);
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

            const curX = this.brainPos.x + Math.cos(p1.t + (p2.t - p1.t) * segProgress) * (p1.r + (p2.r - p1.r) * segProgress);
            const curY = this.brainPos.y + Math.sin(p1.t + (p2.t - p1.t) * segProgress) * (p1.r + (p2.r - p1.r) * segProgress);

            // 1. Draw static background track (subtle but bolder)
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            this.ctx.lineWidth = 1.5;
            let tx = this.brainPos.x + Math.cos(sig.path[0].t) * sig.path[0].r;
            let ty = this.brainPos.y + Math.sin(sig.path[0].t) * sig.path[0].r;
            this.ctx.moveTo(tx, ty);
            for (let i = 1; i < sig.path.length; i++) {
                let px = this.brainPos.x + Math.cos(sig.path[i].t) * sig.path[i].r;
                let py = this.brainPos.y + Math.sin(sig.path[i].t) * sig.path[i].r;
                this.ctx.lineTo(px, py);
            }
            this.ctx.stroke();

            // 2. Draw glowing trail (behind the head)
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 * sig.progress})`;
            this.ctx.lineWidth = sig.width * 1.8;
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';

            this.ctx.moveTo(tx, ty);
            for (let i = 1; i <= currentSeg; i++) {
                let px = this.brainPos.x + Math.cos(sig.path[i].t) * sig.path[i].r;
                let py = this.brainPos.y + Math.sin(sig.path[i].t) * sig.path[i].r;
                this.ctx.lineTo(px, py);
            }
            this.ctx.lineTo(curX, curY);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            // 3. Draw signal head (leading the trail)
            this.ctx.beginPath();
            this.ctx.strokeStyle = sig.color;
            this.ctx.lineWidth = sig.width + 4;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = sig.color;

            const headTailLen = 0.05;
            const prevHeadProgress = Math.max(0, segProgress - headTailLen);
            const prevHeadX = this.brainPos.x + Math.cos(p1.t + (p2.t - p1.t) * prevHeadProgress) * (p1.r + (p2.r - p1.r) * prevHeadProgress);
            const prevHeadY = this.brainPos.y + Math.sin(p1.t + (p2.t - p1.t) * prevHeadProgress) * (p1.r + (p2.r - p1.r) * prevHeadProgress);

            this.ctx.moveTo(curX, curY);
            this.ctx.lineTo(prevHeadX, prevHeadY);
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
