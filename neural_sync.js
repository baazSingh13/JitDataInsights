(() => {
    'use strict';
    const canvas = document.getElementById('sync-canvas');
    const context = canvas?.getContext('2d');
    if (!context) return;
    let width, height, tracks = [], signals = [], frame = 0, lastTime = 0;
    let visible = !('IntersectionObserver' in window);
    const paused = () => document.hidden || !visible || document.documentElement.classList.contains('motion-paused');
    function resize() {
        width = canvas.parentElement.clientWidth; height = canvas.parentElement.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const centerY = height * (width <= 800 ? 0.43 : 0.5);
        // Responsive tracks stay within the canvas; no off-screen cores on narrow phones.
        tracks = Array.from({ length: width < 600 ? 24 : 60 }, (_, index) => {
            const rows = width < 600 ? 12 : 20;
            return {
                coreX: width * (0.8 + Math.floor(index / rows) * 0.035),
                coreY: height * 0.12 + (index % rows) * height * 0.56 / rows,
                targetY: centerY + ((index % rows) - rows / 2) * height * 0.3 / rows,
                busX: width * (0.62 + (index % 5) * 0.015),
                brainX: width * (0.15 + (Math.random() - 0.5) * 0.1),
                brainY: centerY + (Math.random() - 0.5) * height * 0.25
            };
        });
        signals = [];
        synchronize();
    }
    function paint(time = 0, step = 0) {
        context.clearRect(0, 0, width, height);
        const optoX = width * 0.5;
        context.lineWidth = 0.65;
        tracks.forEach(track => {
            context.strokeStyle = 'rgba(0,240,255,.13)';
            context.beginPath(); context.moveTo(track.coreX, track.coreY);
            context.lineTo(track.busX, track.coreY); context.lineTo(track.busX, track.targetY);
            context.lineTo(optoX, track.targetY); context.stroke();
            context.fillStyle = 'rgba(0,240,255,.6)'; context.fillRect(track.coreX - 2, track.coreY - 2, 4, 4);
        });
        if (step && signals.length < (width < 600 ? 24 : 60)) {
            signals.push({ track: tracks[Math.floor(Math.random() * tracks.length)], progress: 0,
                direction: Math.random() > 0.5 ? 1 : -1, speed: 0.003 + Math.random() * 0.003 });
        }
        // Filter after traversal rather than splicing while iterating and skipping adjacent signals.
        signals = signals.filter(signal => signal.progress < 1);
        signals.forEach(signal => {
            signal.progress += signal.speed * step;
            const progress = signal.direction === 1 ? signal.progress : 1 - signal.progress;
            if (progress < 0 || progress > 1) return;
            const track = signal.track;
            context.strokeStyle = signal.direction === 1 ? 'rgba(255,128,255,.7)' : 'rgba(124,252,255,.7)';
            context.fillStyle = signal.direction === 1 ? '#ff80ff' : '#7cfcff';
            if (progress < 0.5) {
                const points = [[track.coreX, track.coreY], [track.busX, track.coreY], [track.busX, track.targetY], [optoX, track.targetY]];
                const segment = progress * 6, index = Math.min(Math.floor(segment), 2), portion = segment - index;
                const a = points[index], b = points[index + 1];
                context.beginPath();
                context.arc(a[0] + (b[0] - a[0]) * portion, a[1] + (b[1] - a[1]) * portion, 1.8, 0, Math.PI * 2);
                context.fill();
            } else {
                const tail = (progress - 0.5) * 2;
                context.beginPath();
                let started = false;
                for (let i = 0; i <= 18; i++) {
                    const p = tail - 0.16 + i / 18 * 0.16;
                    if (p < 0 || p > 1) continue;
                    const x = optoX + (track.brainX - optoX) * p;
                    const y = track.targetY + (track.brainY - track.targetY) * p + Math.sin(p * 45 - time * 0.01 * signal.direction) * 6;
                    if (!started) { context.moveTo(x, y); started = true; } else context.lineTo(x, y);
                }
                context.stroke();
            }
        });
    }
    function tick(time) {
        if (paused()) { frame = 0; return; }
        const step = Math.min((time - (lastTime || time)) / 16.67, 2);
        lastTime = time; paint(time, step); frame = requestAnimationFrame(tick);
    }
    function synchronize() {
        cancelAnimationFrame(frame); frame = 0; lastTime = 0; paint();
        if (!paused()) frame = requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); synchronize(); });
        observer.observe(canvas);
    }
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', synchronize);
    document.addEventListener('motionchange', synchronize);
    resize();
})();
