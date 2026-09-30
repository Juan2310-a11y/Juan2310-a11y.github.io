/**
 * Efecto Interactivo de Partículas y Red de Nodos en Canvas
 * Para el Hero de Juan Apaestegui Portfolio
 */

(function () {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;
    let isVisible = true;

    // Configuración del ratón
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Ajuste de tamaño responsive
    function resizeCanvas() {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
        createParticles();
    }

    // Clase de Partícula
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
            this.density = Math.random() * 20 + 5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Rebotar en bordes
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;

            // Interacción con ratón
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = mouse.radius;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density * 0.4;
                    const directionY = forceDirectionY * force * this.density * 0.4;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }

        draw(color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        // Densidad adaptativa según el ancho de pantalla
        const count = Math.floor((width * height) / 18000);
        const particleCount = Math.min(Math.max(count, 35), 85);

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles(lineColor) {
        const maxDistance = 110;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = lineColor.replace('opacity', (opacity * 0.25).toFixed(2));
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const particleColor = isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(79, 70, 229, 0.45)';
        const lineColor = isDark ? 'rgba(99, 102, 241, opacity)' : 'rgba(79, 70, 229, opacity)';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(particleColor);
        }

        connectParticles(lineColor);
        animationFrameId = requestAnimationFrame(animate);
    }

    // Pausar renderizado cuando el hero no esté en pantalla (ahorro de batería/recursos)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                isVisible = true;
                cancelAnimationFrame(animationFrameId);
                animate();
            } else {
                isVisible = false;
                cancelAnimationFrame(animationFrameId);
            }
        });
    }, { threshold: 0.1 });

    const heroSection = document.getElementById('hero');
    if (heroSection) observer.observe(heroSection);

    // Inicialización
    window.addEventListener('resize', debounce(resizeCanvas, 200));
    resizeCanvas();
    animate();

    function debounce(func, wait) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }
})();
