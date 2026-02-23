class NeuralSyncAnimation {
    constructor() {
        this.canvas = document.getElementById('sync-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.signals = [];
        this.cores = [];
        this.brainPos = { x: 0, y: 0 };

        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    init() {
        this.resize();
        this.createCores();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.brainPos = { x: this.width / 2, y: this.height / 2 };
        this.createCores(); // Re-create cores to fit new dimensions
    }

    createCores() {
        this.cores = [];
        // Create a grid of cores on the periphery
        const padding = 40;
        const spacing = 15;

        // Top and Bottom edges
        for (let x = padding; x < this.width - padding; x += spacing) {
            this.cores.push({ x, y: padding, type: 'edge' });
            this.cores.push({ x, y: this.height - padding, type: 'edge' });
        }
        // Left and Right edges
        for (let y = padding + spacing; y < this.height - padding - spacing; y += spacing) {
            this.cores.push({ x: padding, y, type: 'edge' });
            this.cores.push({ x: this.width - padding, y, type: 'edge' });
        }
    }

    spawnSignal() {
        if (this.cores.length === 0) return;
        const core = this.cores[Math.floor(Math.random() * this.cores.length)];

        // Signal path logic: Horizontal then Vertical (PCB style)
        const path = [
            { x: core.x, y: core.y }
        ];

        // Randomly decide to go horizontal or vertical first
        if (Math.random() > 0.5) {
            path.push({ x: this.brainPos.x, y: core.y });
        } else {
            path.push({ x: core.x, y: this.brainPos.y });
        }
        path.push({ x: this.brainPos.x, y: this.brainPos.y });

        this.signals.push({
            path,
            progress: 0,
            speed: 0.01 + Math.random() * 0.02,
            color: `rgba(0, 240, 255, ${0.4 + Math.random() * 0.6})`,
            width: 1 + Math.random() * 2
        });
    }

    drawCores() {
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        this.cores.forEach(core => {
            this.ctx.fillRect(core.x - 2, core.y - 2, 4, 4);
            // Subtle glow
            if (Math.random() > 0.98) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00f0ff';
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.fillRect(core.x - 2, core.y - 2, 4, 4);
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
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

            // Draw the current position of the signal
            const segmentCount = sig.path.length - 1;
            const absoluteProgress = sig.progress * segmentCount;
            const currentSegment = Math.floor(absoluteProgress);
            const segmentProgress = absoluteProgress - currentSegment;

            const p1 = sig.path[currentSegment];
            const p2 = sig.path[currentSegment + 1];

            const curX = p1.x + (p2.x - p1.x) * segmentProgress;
            const curY = p1.y + (p2.y - p1.y) * segmentProgress;

            // Draw track (subtle)
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            this.ctx.lineWidth = 1;
            this.ctx.moveTo(sig.path[0].x, sig.path[0].y);
            for (let i = 1; i < sig.path.length; i++) {
                this.ctx.lineTo(sig.path[i].x, sig.path[i].y);
            }
            this.ctx.stroke();

            // Draw signal head
            this.ctx.beginPath();
            this.ctx.strokeStyle = sig.color;
            this.ctx.lineWidth = sig.width;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = sig.color;

            // Draw a small tail
            const tailLength = 20;
            const tailProgress = Math.max(0, absoluteProgress - (tailLength / 200));
            const tailSegment = Math.floor(tailProgress * segmentCount);
            // Simplified tail for performance
            this.ctx.moveTo(curX, curY);
            this.ctx.lineTo(curX - (p2.x - p1.x) * 0.1, curY - (p2.y - p1.y) * 0.1);

            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.signals.length < 50) {
            this.spawnSignal();
        }

        this.drawCores();
        this.drawSignals();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NeuralSyncAnimation();
});
