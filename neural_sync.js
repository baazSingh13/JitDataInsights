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

        // Dual Positional Anchors
        this.brainPos = { x: this.width * 0.25, y: this.height * 0.5 };
        this.corePos = { x: this.width * 0.75, y: this.height * 0.5 };

        this.createBrain();
        this.createCores();
    }

    createBrain() {
        this.brainParticles = [];
        const particleCount = 200;
        for (let i = 0; i < particleCount; i++) {
            this.brainParticles.push({
                x: (Math.random() - 0.5) * 350,
                y: (Math.random() - 0.4) * 280,
                z: (Math.random() - 0.5) * 100,
                size: Math.random() * 5 + 3,
                speed: 0.01 + Math.random() * 0.03,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createCores() {
        this.mcus = []; // Rename or repurpose for Neural Core
        const mcuCount = 150;
        const radius = 250; // Radius of the digital core

        for (let i = 0; i < mcuCount; i++) {
            const theta = (i / mcuCount) * Math.PI * 2;
            const x = this.corePos.x + Math.cos(theta) * (Math.random() * radius);
            const y = this.corePos.y + Math.sin(theta) * (Math.random() * radius);
            this.mcus.push({ x, y, theta });
        }
    }

    spawnSignal() {
        // Signals flow from Core to Brain or vice-versa
        const startPole = Math.random() > 0.5 ? this.corePos : this.brainPos;
        const endPole = startPole === this.corePos ? this.brainPos : this.corePos;

        // Path with mid-point curve
        const midX = (startPole.x + endPole.x) / 2;
        const midY = (startPole.y + endPole.y) / 2 + (Math.random() - 0.5) * 400;

        this.signals.push({
            p0: { ...startPole },
            p1: { x: midX, y: midY },
            p2: { ...endPole },
            progress: 0,
            speed: 0.005 + Math.random() * 0.015,
            width: 2 + Math.random() * 6,
            color: `rgba(0, 240, 255, ${0.3 + Math.random() * 0.7})`
        });
    }

    drawBrain() {
        const time = Date.now() * 0.001;
        this.ctx.save();
        this.ctx.translate(this.brainPos.x, this.brainPos.y);

        this.brainParticles.forEach(p => {
            const glow = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 240, 255, ${0.2 + glow * 0.8})`;
            const yOffset = Math.sin(time + p.phase) * 15;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y + yOffset, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (glow > 0.8) {
                this.ctx.shadowBlur = 30;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.restore();
    }

    drawCores() {
        // Drawing the Neural Core (Right side)
        const time = Date.now() * 0.001;
        this.ctx.save();
        this.ctx.translate(this.corePos.x, this.corePos.y);

        this.mcus.forEach((m, i) => {
            const glow = Math.sin(time + i) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 240, 255, ${0.1 + glow * 0.4})`;
            const size = 15 + glow * 10;

            // Geometric Squares for digital feel
            this.ctx.rotate(0.01);
            this.ctx.fillRect(m.x - this.corePos.x - size / 2, m.y - this.corePos.y - size / 2, size, size);

            if (glow > 0.9) {
                this.ctx.shadowBlur = 25;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.strokeRect(m.x - this.corePos.x - size / 2, m.y - this.corePos.y - size / 2, size, size);
                this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.restore();
    }

    drawSignals() {
        this.signals.forEach((sig, index) => {
            sig.progress += sig.speed;
            if (sig.progress >= 1) {
                this.signals.splice(index, 1);
                return;
            }

            // Quadratic Bezier Path
            const t = sig.progress;
            const curX = (1 - t) * (1 - t) * sig.p0.x + 2 * (1 - t) * t * sig.p1.x + t * t * sig.p2.x;
            const curY = (1 - t) * (1 - t) * sig.p0.y + 2 * (1 - t) * t * sig.p1.y + t * t * sig.p2.y;

            // Trail
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.2 * (1 - t)})`;
            this.ctx.lineWidth = sig.width;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00f0ff';

            // Approximate trail by drawing segment of curve
            const prevT = Math.max(0, t - 0.1);
            const prevX = (1 - prevT) * (1 - prevT) * sig.p0.x + 2 * (1 - prevT) * prevT * sig.p1.x + prevT * prevT * sig.p2.x;
            const prevY = (1 - prevT) * (1 - prevT) * sig.p0.y + 2 * (1 - prevT) * prevT * sig.p1.y + prevT * prevT * sig.p2.y;

            this.ctx.moveTo(prevX, prevY);
            // Head
            this.ctx.beginPath();
            this.ctx.fillStyle = '#00f0ff';
            this.ctx.arc(curX, curY, sig.width / 2 + 1, 0, Math.PI * 2);
            this.ctx.fill();
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
