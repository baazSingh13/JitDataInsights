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

        // 1. Create 100 Neural Cores (Mass Scaling)
        this.cores = [];
        const coreRows = 20;
        const coreCols = 5;
        const colSpacing = 15;
        const rowSpacing = this.height * 0.8 / coreRows;

        for (let i = 0; i < 100; i++) {
            const row = i % coreRows;
            const col = Math.floor(i / coreRows);
            this.cores.push({
                x: coreX + col * colSpacing,
                y: (this.height * 0.1) + row * rowSpacing,
                id: i
            });
        }

        // 2. Create 100 Engineered Tracks
        this.tracks = [];
        this.cores.forEach((core, coreIdx) => {
            const wireIdx = coreIdx;
            const stepOut = 30 + (coreIdx % 10) * 3;
            const busX = coreX - 60 - (wireIdx * 0.6);
            const targetY = this.optoPos.y + (wireIdx - 50) * 1.5;

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
                brainTargetX: this.brainPos.x + (Math.random() - 0.5) * 130,
                brainTargetY: this.brainPos.y + (Math.random() - 0.5) * 160
            });
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
        const toBrain = Math.random() > 0.45;

        this.signals.push({
            track,
            direction: toBrain ? 'toBrain' : 'toCore',
            stage: toBrain ? 'electrical' : 'optical',
            progress: 0,
            speed: 0.005 + Math.random() * 0.01,
            width: 1.0 + Math.random() * 1.5,
            color: toBrain ? '#00f0ff' : '#ff00ff' // Cyan for Machine, Magenta for Brain
        });
    }

    drawBrain() {
        // No procedural brain drawing needed anymore as we use <img>
        // Optional: add a subtle particle cloud around the image if desired
    }

    // drawCores method removed

    drawInfrastructure() {
        // Draw Electrical Tracks (Subtle high-density bus)
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        this.ctx.lineWidth = 0.4;
        this.tracks.forEach(track => {
            this.ctx.moveTo(track.points[0].x, track.points[0].y);
            for (let i = 1; i < track.points.length; i++) {
                this.ctx.lineTo(track.points[i].x, track.points[i].y);
            }
        });
        this.ctx.stroke();

        // 100 Cores Visualization
        this.cores.forEach(core => {
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
            this.ctx.fillRect(core.x - 3, core.y - 3, 6, 6);

            const pulse = Math.sin(Date.now() * 0.005 + core.id) * 0.5 + 0.5;
            if (pulse > 0.85) {
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.fillRect(core.x - 1, core.y - 1, 2, 2);
            }
        });
    }

    drawSignals() {
        this.signals.forEach((sig, index) => {
            sig.progress += sig.speed;

            if (sig.progress >= 1) {
                if (sig.direction === 'toBrain' && sig.stage === 'electrical') {
                    sig.stage = 'optical';
                    sig.progress = 0;
                    sig.speed *= 1.3;
                    sig.color = '#e0ffff'; // Optical Cyan-White
                } else if (sig.direction === 'toCore' && sig.stage === 'optical') {
                    sig.stage = 'electrical';
                    sig.progress = 0;
                    sig.speed *= 0.8;
                    sig.color = '#ff00ff'; // Returning Magenta
                } else {
                    this.signals.splice(index, 1);
                    return;
                }
            }

            if (sig.stage === 'electrical') {
                const points = sig.track.points;
                const segmentCount = points.length - 1;

                // For toBrain: progress 0 (core) -> 1 (opto)
                // For toCore: progress 0 (opto) -> 1 (core) 
                const pValue = sig.direction === 'toBrain' ? sig.progress : (1 - sig.progress);
                const absProgress = pValue * segmentCount;
                const currentSeg = Math.min(Math.floor(absProgress), segmentCount - 1);
                const segProgress = absProgress - currentSeg;

                const p1 = points[currentSeg];
                const p2 = points[currentSeg + 1];
                const x = p1.x + (p2.x - p1.x) * segProgress;
                const y = p1.y + (p2.y - p1.y) * segProgress;

                this.ctx.beginPath();
                this.ctx.fillStyle = sig.color;
                this.ctx.shadowBlur = 6;
                this.ctx.shadowColor = sig.color;
                this.ctx.arc(x, y, sig.width, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } else {
                // Optical State: Narrow Discrete Pulses (No growing lines)
                const startX = this.optoPos.x;
                const startY = sig.track.targetY;
                const endX = sig.track.brainTargetX;
                const endY = sig.track.brainTargetY;

                // For toBrain: progress 0 (opto) -> 1 (brain)
                // For toCore: progress 0 (brain) -> 1 (opto)
                const t = sig.direction === 'toBrain' ? sig.progress : (1 - sig.progress);
                const curX = startX + (endX - startX) * t;
                const curY = startY + (endY - startY) * t;

                // Discrete Pulse Head (Narrow & Sharp)
                this.ctx.beginPath();
                const alpha = sig.direction === 'toBrain' ? (1 - sig.progress) : sig.progress;
                const headColor = sig.direction === 'toBrain' ? '224, 255, 255' : '255, 0, 255';

                this.ctx.fillStyle = `rgba(${headColor}, ${alpha * 0.9})`;
                this.ctx.shadowBlur = 6;
                this.ctx.shadowColor = sig.color;
                this.ctx.arc(curX, curY, sig.width * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;

                // Tiny localized trail
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(${headColor}, ${alpha * 0.3})`;
                this.ctx.lineWidth = sig.width * 0.3;
                const trailLen = 12;
                const angle = Math.atan2(endY - startY, endX - startX) * (sig.direction === 'toBrain' ? 1 : -1);
                this.ctx.moveTo(curX, curY);
                this.ctx.lineTo(curX - Math.cos(angle) * trailLen, curY - Math.sin(angle) * trailLen);
                this.ctx.stroke();
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // High load for 100 cores
        if (this.signals.length < 150) {
            for (let i = 0; i < 5; i++) this.spawnSignal();
        }

        this.drawInfrastructure();
        this.drawSignals();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralSyncAnimation();
});
