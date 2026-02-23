class NeuralSyncAnimation {
    constructor() {
        this.canvas = document.getElementById('sync-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.signals = [];
        this.cores = []; // Now stores 10 fixed Neural Cores
        this.tracks = []; // Stores 100 fixed engineered paths (10 per core)
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

        // Positional Anchors
        this.brainPos = { x: this.width * 0.2, y: this.height * 0.5 };
        const coreX = this.width * 0.85;

        // 1. Create 10 Neural Cores in a vertical bus
        this.cores = [];
        const coreSpacing = this.height * 0.7 / 9;
        const startY = this.height * 0.15;
        for (let i = 0; i < 10; i++) {
            this.cores.push({
                x: coreX,
                y: startY + i * coreSpacing,
                id: i
            });
        }

        // 2. Create 100 Engineered Tracks (10 per core)
        this.tracks = [];
        this.cores.forEach((core, coreIdx) => {
            for (let j = 0; j < 10; j++) {
                // Orthogonal routing logic (Manhattan style)
                // Path: Core -> Step-out -> Vertical Bus -> Step-in -> Brain
                const wireIdx = coreIdx * 10 + j;
                const stepOut = 40 + j * 5;
                const busX = coreX - 80 - (wireIdx * 3); // Spacing for 100 wires
                const targetY = this.brainPos.y + (wireIdx - 50) * 4; // Converging at brain

                this.tracks.push({
                    coreIdx,
                    points: [
                        { x: core.x, y: core.y },
                        { x: core.x - stepOut, y: core.y },
                        { x: busX, y: core.y },
                        { x: busX, y: targetY },
                        { x: this.brainPos.x + 150, y: targetY },
                        { x: this.brainPos.x, y: targetY } // Target brain particles
                    ]
                });
            }
        });

        this.createBrain();
    }

    createBrain() {
        this.brainParticles = [];
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            this.brainParticles.push({
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.4) * 200,
                z: (Math.random() - 0.5) * 60,
                size: Math.random() * 4 + 2,
                speed: 0.01 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    // createCores method removed as it's integrated into resize and drawInfrastructure

    spawnSignal() {
        if (this.tracks.length === 0) return;
        const track = this.tracks[Math.floor(Math.random() * this.tracks.length)];

        this.signals.push({
            track,
            progress: 0,
            speed: 0.004 + Math.random() * 0.008,
            width: 1.5 + Math.random() * 2.5,
            color: `rgba(0, 240, 255, ${0.5 + Math.random() * 0.5})`
        });
    }

    drawBrain() {
        const time = Date.now() * 0.001;
        this.ctx.save();
        this.ctx.translate(this.brainPos.x, this.brainPos.y);

        this.brainParticles.forEach(p => {
            const glow = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 240, 255, ${0.1 + glow * 0.6})`;
            const yOffset = Math.sin(time + p.phase) * 10;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y + yOffset, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (glow > 0.85) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.restore();
    }

    // drawCores method removed

    drawInfrastructure() {
        // Draw static orthogonal tracks
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        this.ctx.lineWidth = 0.8;

        this.tracks.forEach(track => {
            this.ctx.moveTo(track.points[0].x, track.points[0].y);
            for (let i = 1; i < track.points.length; i++) {
                this.ctx.lineTo(track.points[i].x, track.points[i].y);
            }
        });
        this.ctx.stroke();

        // Draw 10 Cores
        this.cores.forEach(core => {
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
            this.ctx.fillRect(core.x - 12, core.y - 12, 24, 24);

            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(core.x - 12, core.y - 12, 24, 24);

            // Core Glow
            const pulse = Math.sin(Date.now() * 0.002 + core.id) * 0.5 + 0.5;
            if (pulse > 0.7) {
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.fillRect(core.x - 4, core.y - 4, 8, 8);
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.strokeRect(core.x - 15, core.y - 15, 30, 30);
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

            const points = sig.track.points;
            const segmentCount = points.length - 1;
            const absProgress = sig.progress * segmentCount;
            const currentSeg = Math.floor(absProgress);
            const segProgress = absProgress - currentSeg;

            // Ensure currentSeg and currentSeg + 1 are valid indices
            if (currentSeg < 0 || currentSeg >= segmentCount) {
                // This should ideally not happen if progress is between 0 and 1
                // and segmentCount is correctly calculated.
                return;
            }

            const p1 = points[currentSeg];
            const p2 = points[currentSeg + 1];

            const curX = p1.x + (p2.x - p1.x) * segProgress;
            const curY = p1.y + (p2.y - p1.y) * segProgress;

            // Signal Path (subtle highlight)
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - sig.progress)})`;
            this.ctx.lineWidth = sig.width;
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(curX, curY);
            this.ctx.stroke();

            // Glowing Head
            this.ctx.beginPath();
            this.ctx.fillStyle = sig.color;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#00f0ff';
            this.ctx.arc(curX, curY, sig.width / 2 + 1, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.signals.length < 80) {
            for (let i = 0; i < 2; i++) this.spawnSignal();
        }

        this.drawInfrastructure();
        this.drawBrain();
        this.drawSignals();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralSyncAnimation();
});
