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
        const mcuCount = 100;
        const pinsPerMCU = 100;
        const padding = 60;

        for (let i = 0; i < mcuCount; i++) {
            // Randomly place MCUs on the periphery
            let x, y;
            const side = Math.floor(Math.random() * 4);
            if (side === 0) { // Top
                x = padding + Math.random() * (this.width - padding * 2);
                y = padding - 15;
            } else if (side === 1) { // Bottom
                x = padding + Math.random() * (this.width - padding * 2);
                y = this.height - padding + 15;
            } else if (side === 2) { // Left
                x = padding - 15;
                y = padding + Math.random() * (this.height - padding * 2);
            } else { // Right
                x = this.width - padding + 15;
                y = padding + Math.random() * (this.height - padding * 2);
            }

            const mcu = { x, y, pins: [] };

            // Create pins for each MCU (as a tight cluster)
            for (let j = 0; j < pinsPerMCU; j++) {
                mcu.pins.push({
                    dx: (Math.random() - 0.5) * 10,
                    dy: (Math.random() - 0.5) * 10
                });
            }
            this.cores.push(mcu);
        }
    }

    spawnSignal() {
        if (this.cores.length === 0) return;
        const mcu = this.cores[Math.floor(Math.random() * this.cores.length)];
        const pin = mcu.pins[Math.floor(Math.random() * mcu.pins.length)];

        const startX = mcu.x + pin.dx;
        const startY = mcu.y + pin.dy;

        // Multi-segment path (Manhattan style)
        const path = [{ x: startX, y: startY }];

        // Add a mid-junction for more "complexity"
        const midX = startX + (this.brainPos.x - startX) * Math.random();
        const midY = startY + (this.brainPos.y - startY) * Math.random();

        if (Math.random() > 0.5) {
            path.push({ x: midX, y: startY });
            path.push({ x: midX, y: midY });
        } else {
            path.push({ x: startX, y: midY });
            path.push({ x: midX, y: midY });
        }

        path.push({ x: this.brainPos.x, y: midY });
        path.push({ x: this.brainPos.x, y: this.brainPos.y });

        this.signals.push({
            path,
            progress: 0,
            speed: 0.005 + Math.random() * 0.015,
            color: `rgba(0, 240, 255, ${0.3 + Math.random() * 0.7})`,
            width: 0.5 + Math.random() * 1.5
        });
    }

    drawCores() {
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        this.cores.forEach(mcu => {
            // Draw MCU body
            this.ctx.fillRect(mcu.x - 4, mcu.y - 4, 8, 8);

            // Draw a few "active" pins as tiny dots
            if (Math.random() > 0.9) {
                this.ctx.fillStyle = '#00f0ff';
                const p = mcu.pins[Math.floor(Math.random() * mcu.pins.length)];
                this.ctx.fillRect(mcu.x + p.dx - 1, mcu.y + p.dy - 1, 2, 2);
                this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
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
            const absoluteProgress = sig.progress * segmentCount;
            const currentSegment = Math.floor(absoluteProgress);
            const segmentProgress = absoluteProgress - currentSegment;

            const p1 = sig.path[currentSegment];
            const p2 = sig.path[currentSegment + 1];

            const curX = p1.x + (p2.x - p1.x) * segmentProgress;
            const curY = p1.y + (p2.y - p1.y) * segmentProgress;

            // Draw track with higher detail but lower opacity to handle density
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(sig.path[0].x, sig.path[0].y);
            for (let i = 1; i < sig.path.length; i++) {
                this.ctx.lineTo(sig.path[i].x, sig.path[i].y);
            }
            this.ctx.stroke();

            // Signal head
            this.ctx.beginPath();
            this.ctx.strokeStyle = sig.color;
            this.ctx.lineWidth = sig.width;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = sig.color;

            // Short, fast pulse
            this.ctx.moveTo(curX, curY);
            const prevProgress = Math.max(0, segmentProgress - 0.05);
            const prevX = p1.x + (p2.x - p1.x) * prevProgress;
            const prevY = p1.y + (p2.y - p1.y) * prevProgress;
            this.ctx.lineTo(prevX, prevY);

            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Increase max signals for "dense" feel
        if (this.signals.length < 200) {
            for (let i = 0; i < 3; i++) this.spawnSignal();
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
