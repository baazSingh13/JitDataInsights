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
        // createBrain() call removed as brain is now an image
    }

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Positional Anchors
        this.brainPos = { x: this.width * 0.15, y: this.height * 0.5 };
        this.optoPos = { x: this.width * 0.5, y: this.height * 0.5 };
        const coreX = this.width * 0.85;

        // 1. Create 10 Neural Cores
        this.cores = [];
        const coreSpacing = this.height * 0.7 / 9;
        const startY = this.height * 0.15;
        for (let i = 0; i < 10; i++) {
            this.cores.push({ x: coreX, y: startY + i * coreSpacing, id: i });
        }

        // 2. Create 100 Engineered Tracks (Electrical Stage: Core -> Coupler)
        this.tracks = [];
        this.cores.forEach((core, coreIdx) => {
            for (let j = 0; j < 10; j++) {
                const wireIdx = coreIdx * 10 + j;
                const stepOut = 50 + j * 4;
                const busX = coreX - 100 - (wireIdx * 1.5);
                const targetY = this.optoPos.y + (wireIdx - 50) * 2;

                this.tracks.push({
                    type: 'electrical',
                    points: [
                        { x: core.x, y: core.y },
                        { x: core.x - stepOut, y: core.y },
                        { x: busX, y: core.y },
                        { x: busX, y: targetY },
                        { x: this.optoPos.x, y: targetY }
                    ],
                    targetY: targetY,
                    // Random brain penetration: Target coordinates inside the brain image
                    brainTargetX: this.brainPos.x + (Math.random() - 0.5) * 120,
                    brainTargetY: this.brainPos.y + (Math.random() - 0.5) * 140
                });
            }
        });
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
            stage: 'electrical',
            progress: 0,
            speed: 0.005 + Math.random() * 0.01,
            width: 1.5 + Math.random() * 2,
            color: '#00f0ff'
        });
    }

    drawBrain() {
        // No procedural brain drawing needed anymore as we use <img>
        // Optional: add a subtle particle cloud around the image if desired
    }

    // drawCores method removed

    drawInfrastructure() {
        // Draw Electrical Tracks (Right to Middle)
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        this.ctx.lineWidth = 0.6;
        this.tracks.forEach(track => {
            this.ctx.moveTo(track.points[0].x, track.points[0].y);
            for (let i = 1; i < track.points.length; i++) {
                this.ctx.lineTo(track.points[i].x, track.points[i].y);
            }
        });
        this.ctx.stroke();

        // Draw Optical Links (Middle to Left) - Fading into random brain targets
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        this.ctx.lineWidth = 0.8;
        this.tracks.forEach(track => {
            this.ctx.moveTo(this.optoPos.x, track.targetY);
            this.ctx.lineTo(track.brainTargetX, track.brainTargetY);
        });
        this.ctx.stroke();

        // Draw 10 Cores
        this.cores.forEach(core => {
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            this.ctx.fillRect(core.x - 10, core.y - 10, 20, 20);
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            this.ctx.strokeRect(core.x - 10, core.y - 10, 20, 20);

            const pulse = Math.sin(Date.now() * 0.003 + core.id) * 0.5 + 0.5;
            if (pulse > 0.8) {
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.fillRect(core.x - 3, core.y - 3, 6, 6);
            }
        });
    }

    drawSignals() {
        this.signals.forEach((sig, index) => {
            sig.progress += sig.speed;

            if (sig.progress >= 1) {
                if (sig.stage === 'electrical') {
                    // Transition to Optical Stage
                    sig.stage = 'optical';
                    sig.progress = 0;
                    sig.speed *= 1.5; // Light is faster
                    sig.color = 'rgba(255, 255, 255, 0.9)';
                } else {
                    // Signal reached brain
                    this.signals.splice(index, 1);
                    return;
                }
            }

            if (sig.stage === 'electrical') {
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

                this.ctx.beginPath();
                this.ctx.fillStyle = sig.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.arc(curX, curY, sig.width, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } else {
                // Optical State (Direct beam into random brain target)
                const startX = this.optoPos.x;
                const startY = sig.track.targetY;
                const endX = sig.track.brainTargetX;
                const endY = sig.track.brainTargetY;

                const curX = startX + (endX - startX) * sig.progress;
                const curY = startY + (endY - startY) * sig.progress;

                this.ctx.beginPath();
                this.ctx.strokeStyle = sig.color;
                this.ctx.lineWidth = sig.width * 1.5;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#fff';
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(curX, curY);
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;

                // Light pulse head (fading as it enters)
                this.ctx.beginPath();
                this.ctx.fillStyle = `rgba(255, 255, 255, ${1 - sig.progress})`;
                this.ctx.arc(curX, curY, sig.width * 1.2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.signals.length < 60) {
            for (let i = 0; i < 2; i++) this.spawnSignal();
        }

        this.drawInfrastructure();
        this.drawSignals();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralSyncAnimation();
});
