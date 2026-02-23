document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('header');
    const updateHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', updateHeader);
    updateHeader();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            mobileBtn.classList.toggle('active');
        });
    }

    // Intersection Observer for Fade-In Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a small delay for staggered effect if multiple items hit at once
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu
                if (navLinks && window.innerWidth < 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    // --- REFINED PARTICLE ANIMATION ---
    const canvas = document.getElementById('data-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const particleColor = '#00f0ff';
        const lineColor = 'rgba(0, 240, 255, 0.1)';

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            init();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            const count = Math.floor((width * height) / 15000);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.update();
                p1.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.2 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // --- FIREBASE INTEGRATION ---
    const firebaseConfig = {
        apiKey: "AIzaSyBmpMxcF7EHjeFKS-IrEWij8sDnQsngRSQ",
        authDomain: "jitdatainsights.firebaseapp.com",
        projectId: "jitdatainsights",
        storageBucket: "jitdatainsights.firebasestorage.app",
        messagingSenderId: "142667569709",
        appId: "1:142667569709:web:b845ad8ed266dbe1ae36a4",
        measurementId: "G-1769B6ETWW"
    };

    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            const db = firebase.firestore();
            const contactForm = document.getElementById('contact-form');

            if (contactForm) {
                contactForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const btn = contactForm.querySelector('button');
                    const originalText = btn.textContent;

                    const nameInput = contactForm.querySelector('input[type="text"]');
                    const emailInput = contactForm.querySelector('input[type="email"]');
                    const messageInput = contactForm.querySelector('textarea');

                    btn.textContent = 'Transmitting...';
                    btn.disabled = true;

                    try {
                        await db.collection("contacts").add({
                            name: nameInput.value,
                            email: emailInput.value,
                            message: messageInput.value,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        btn.textContent = 'Transmission Success!';
                        btn.style.background = '#00f0ff';
                        contactForm.reset();

                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = ''; // Revert to CSS default
                            btn.disabled = false;
                        }, 3000);

                    } catch (error) {
                        console.error("Error adding document: ", error);
                        alert("Transmission Failed: " + error.message);
                        btn.textContent = 'Retry Transmission';
                        btn.disabled = false;
                    }
                });
            }
        } catch (e) {
            console.log("Firebase Init Error", e);
        }
    }
});
