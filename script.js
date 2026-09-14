(() => {
    'use strict';
    const header = document.getElementById('main-header');
    const menuButton = document.querySelector('.mobile-menu-btn');
    const navigation = document.getElementById('primary-navigation');
    const mobileViewport = window.matchMedia('(max-width: 800px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionButton = document.getElementById('motion-toggle');
    function setMenu(open, restoreFocus = false) {
        navigation.classList.toggle('is-open', open);
        menuButton.classList.toggle('active', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        if (restoreFocus) menuButton.focus();
    }
    if (header && menuButton && navigation) {
        header.classList.add('menu-ready');
        menuButton.hidden = false;
        menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
        navigation.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (!link || !mobileViewport.matches) return;
            setMenu(false);
            // Keep native anchor URLs/history, and move focus out of the hidden menu.
            const target = document.getElementById(link.hash.slice(1));
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
        });
        document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
        header.addEventListener('focusout', event => {
            if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
        });
        mobileViewport.addEventListener('change', () => setMenu(false, mobileViewport.matches && navigation.contains(document.activeElement)));
        const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 50);
        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }
    function setMotion(paused) {
        document.documentElement.classList.toggle('motion-paused', paused);
        if (motionButton) {
            motionButton.textContent = paused ? 'Play animations' : 'Pause animations';
            motionButton.setAttribute('aria-pressed', String(paused));
        }
        document.dispatchEvent(new CustomEvent('motionchange'));
    }
    setMotion(reducedMotion.matches);
    if (motionButton) {
        motionButton.hidden = false;
        motionButton.addEventListener('click', () => setMotion(!document.documentElement.classList.contains('motion-paused')));
    }
    reducedMotion.addEventListener('change', event => setMotion(event.matches));
    const year = document.getElementById('copyright-year');
    if (year) year.textContent = String(new Date().getFullYear());
    // Progressive enhancement: content is visible without JavaScript or IntersectionObserver.
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        const reveal = new IntersectionObserver(entries => {
            for (const entry of entries) if (entry.isIntersecting) {
                entry.target.classList.remove('reveal-pending');
                reveal.unobserve(entry.target);
            }
        }, { threshold: 0.05 });
        document.querySelectorAll('.fade-in').forEach(element => {
            if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('reveal-pending');
            reveal.observe(element);
        });
    }
    setupBackground();

    function setupBackground() {
        const canvas = document.getElementById('data-canvas');
        const context = canvas?.getContext('2d');
        if (!context) return;
        let width, height, particles = [], frame = 0, lastTime = 0;
        const running = () => !document.hidden && !document.documentElement.classList.contains('motion-paused');
        function paint(step = 0) {
            context.clearRect(0, 0, width, height);
            particles.forEach((particle, index) => {
                particle.x += particle.vx * step;
                particle.y += particle.vy * step;
                if (particle.x < 0 || particle.x > width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > height) particle.vy *= -1;
                context.beginPath();
                context.arc(particle.x, particle.y, 1.2, 0, Math.PI * 2);
                context.fillStyle = '#00f0ff';
                context.fill();
                for (let j = index + 1; j < particles.length; j++) {
                    const other = particles[j];
                    const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
                    if (distance >= 140) continue;
                    context.beginPath();
                    context.strokeStyle = `rgba(0,240,255,${0.16 * (1 - distance / 140)})`;
                    context.lineWidth = 0.5;
                    context.moveTo(particle.x, particle.y);
                    context.lineTo(other.x, other.y);
                    context.stroke();
                }
            });
        }
        function tick(time) {
            if (!running()) { frame = 0; return; }
            paint(Math.min((time - (lastTime || time)) / 16.67, 2));
            lastTime = time;
            frame = requestAnimationFrame(tick);
        }
        function synchronize() {
            cancelAnimationFrame(frame); frame = 0; lastTime = 0;
            paint();
            if (running()) frame = requestAnimationFrame(tick);
        }
        function resize() {
            width = window.innerWidth; height = window.innerHeight;
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            particles = Array.from({ length: Math.min(60, Math.ceil(width * height / 24000)) }, () => ({
                x: Math.random() * width, y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
            }));
            synchronize();
        }
        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', synchronize);
        document.addEventListener('motionchange', synchronize);
        resize();
    }
})();
