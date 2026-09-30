/**
 * LÓGICA PRINCIPAL - PORTAFOLIO JUAN APAESTEGUI
 * Interacciones, Modo Oscuro, Filtros, Modal, Validaciones y Animaciones
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTypewriter();
    initScrollProgress();
    initNavigation();
    initStatsCounter();
    initProjectFilters();
    initProjectModals();
    initContactForm();
    initScrollReveals();
});

/* ==========================================================
   1. CONTROL DE TEMA (MODO OSCURO / CLARO)
   ========================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Detectar preferencia guardada o del sistema
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else if (!prefersDark) {
        htmlElement.setAttribute('data-theme', 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('portfolio-theme', nextTheme);
        });
    }
}

/* ==========================================================
   2. EFECTO TYPEWRITER (HERO)
   ========================================================== */
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
        'Desarrollo Web Full Stack',
        'Arquitectura de Software',
        'Experiencias UI/UX Modernas',
        'APIs & Microservicios',
        'Soluciones Cloud Escalables'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            el.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 45;
        } else {
            el.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 90;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pausa al terminar de escribir la frase
            typingSpeed = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 400;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* ==========================================================
   3. BARRA DE PROGRESO DE LECTURA Y SCROLL HEADER
   ========================================================== */
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    const header = document.getElementById('header');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }

        // Header shadow / compact
        if (header) {
            if (winScroll > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Botón Back to top
        if (backToTop) {
            if (winScroll > 350) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================
   4. NAVEGACIÓN MÓVIL Y ACTIVE LINKS
   ========================================================== */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer click en cualquier link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

    // Resaltar link activo según la sección visible
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
}

/* ==========================================================
   5. CONTADORES DE ESTADÍSTICAS ANIMADOS
   ========================================================== */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number, .badge-num');
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                stats.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target') || counter.textContent);
                    const suffix = counter.textContent.includes('%') ? '%' : '+';
                    let current = 0;
                    const stepTime = Math.max(15, Math.floor(1500 / target));

                    const timer = setInterval(() => {
                        current += 1;
                        counter.textContent = current + suffix;
                        if (current >= target) {
                            counter.textContent = target + suffix;
                            clearInterval(timer);
                        }
                    }, stepTime);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) observer.observe(statsGrid);
}

/* ==========================================================
   6. FILTRO DE PROYECTOS
   ========================================================== */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================
   7. MODAL DE DETALLE DE PROYECTOS (LIGHTBOX)
   ========================================================== */
const projectData = {
    'modal-1': {
        title: 'CloudMetrics Dashboard',
        category: 'Full Stack / SaaS',
        description: 'Plataforma empresarial de analítica en tiempo real para empresas de tecnología y retail. Permite visualizar KPIs críticos, procesar millones de eventos por segundo y exportar informes ejecutivos automatizados en PDF y Excel.',
        features: [
            'Visualización con gráficos dinámicos e interactivos.',
            'Conexión mediante WebSockets para streaming de datos en vivo.',
            'Autenticación empresarial con soporte multi-inquilino (Multi-tenant).',
            'Base de datos optimizada en PostgreSQL con particionamiento y caché Redis.'
        ],
        stack: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
        demoUrl: '#',
        repoUrl: '#'
    },
    'modal-2': {
        title: 'Aura Luxe Store',
        category: 'Frontend / E-Commerce',
        description: 'Plataforma de comercio electrónico para una marca de indumentaria y diseño de lujo. Desarrollada con un fuerte enfoque en velocidad de carga, animaciones microinteractivas fluidas y un proceso de checkout sin fricciones.',
        features: [
            'Puntuación 98/100 en Google Lighthouse para rendimiento y accesibilidad.',
            'Integración simulada de pagos mediante Stripe Elements.',
            'Búsqueda instantánea con filtros combinados y estado global con Zustand.',
            'Diseño 100% responsivo probado en más de 12 dispositivos diferentes.'
        ],
        stack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Zustand', 'Stripe API'],
        demoUrl: '#',
        repoUrl: '#'
    },
    'modal-3': {
        title: 'Nexus Gateway Microservice',
        category: 'Backend / APIs',
        description: 'Microservicio central de autenticación y autorización distribuida para un ecosistema de aplicaciones móviles y web. Incorpora mecanismos avanzados de seguridad contra ataques de fuerza bruta y mitigación DDoS.',
        features: [
            'Generación y rotación segura de tokens JWT y Refresh Tokens.',
            'Rate limiting distribuido con Redis (Token Bucket Algorithm).',
            'Documentación viva y ejecutable generada automáticamente con OpenAPI / Swagger.',
            'Pipeline automatizado de pruebas unitarias y cobertura de código al 94%.'
        ],
        stack: ['Python', 'FastAPI', 'Redis', 'Docker', 'Pytest', 'GitHub Actions'],
        demoUrl: '#',
        repoUrl: '#'
    },
    'modal-4': {
        title: 'FlowBoard Collaborative',
        category: 'Full Stack / Productividad',
        description: 'Aplicación web colaborativa de gestión de proyectos inspirada en metodologías ágiles. Los equipos pueden gestionar tableros Kanban interactivos con sincronización instantánea entre múltiples usuarios conectados.',
        features: [
            'Arrastrar y soltar (Drag & drop) suave y adaptativo.',
            'Notificaciones en tiempo real vía Socket.io ante cambios de estado.',
            'Historial de actividad de tareas y asignación granular de permisos.',
            'Persistencia en MongoDB con esquemas altamente optimizados.'
        ],
        stack: ['React', 'Next.js', 'Socket.io', 'MongoDB', 'Node.js', 'Framer Motion'],
        demoUrl: '#',
        repoUrl: '#'
    }
};

function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    const detailButtons = document.querySelectorAll('.btn-project-detail');

    if (!modal || !modalBody) return;

    function openModal(modalId) {
        const data = projectData[modalId];
        if (!data) return;

        modalBody.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <span class="section-tag" style="margin-bottom: 0.5rem;">${data.category}</span>
                <h2 style="font-size: 1.8rem; font-weight: 800; margin-top: 0.4rem;">${data.title}</h2>
            </div>
            
            <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem;">
                ${data.description}
            </p>

            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem;">Características Principales:</h4>
            <ul style="list-style: none; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                ${data.features.map(f => `
                    <li style="display: flex; gap: 0.6rem; font-size: 0.92rem; color: var(--text-secondary);">
                        <span style="color: var(--accent-cyan); font-weight: bold;">✔</span> ${f}
                    </li>
                `).join('')}
            </ul>

            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem;">Tecnologías Utilizadas:</h4>
            <div class="project-tags" style="margin-bottom: 2rem;">
                ${data.stack.map(s => `<span class="tag">${s}</span>`).join('')}
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <a href="${data.demoUrl}" class="btn btn-primary" target="_blank">
                    <span>Ver Demo Online</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
                <a href="${data.repoUrl}" class="btn btn-secondary" target="_blank">
                    <span>Repositorio GitHub</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    detailButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================
   8. FORMULARIO DE CONTACTO Y TOAST NOTIFICATION
   ========================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMsg = document.getElementById('toast-message');

    if (!form) return;

    function showToast(title, message, isSuccess = true) {
        if (!toast) return;
        toastTitle.textContent = title;
        toastMsg.textContent = message;
        
        toast.style.borderLeftColor = isSuccess ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validaciones
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        const nameError = document.getElementById('name-error');
        const emailError = document.getElementById('email-error');
        const messageError = document.getElementById('message-error');

        let isValid = true;

        // Validar Nombre
        if (!nameInput.value.trim()) {
            nameError.textContent = 'Por favor, introduce tu nombre.';
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameError.textContent = '';
            nameInput.classList.remove('error');
        }

        // Validar Correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Por favor, introduce un correo electrónico válido.';
            emailInput.classList.add('error');
            isValid = false;
        } else {
            emailError.textContent = '';
            emailInput.classList.remove('error');
        }

        // Validar Mensaje
        if (!messageInput.value.trim()) {
            messageError.textContent = 'Por favor, escribe tu mensaje.';
            messageInput.classList.add('error');
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            messageError.textContent = 'El mensaje debe contener al menos 10 caracteres.';
            messageInput.classList.add('error');
            isValid = false;
        } else {
            messageError.textContent = '';
            messageInput.classList.remove('error');
        }

        if (!isValid) return;

        // Estado de carga en el botón
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span>Enviando mensaje...</span>
            <span style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:rotateSlow 0.8s linear infinite;"></span>
        `;

        // Simulación de envío exitoso
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            form.reset();

            showToast(
                '¡Mensaje Enviado con Éxito!',
                'Gracias por contactarme, Juan responderá lo más pronto posible.'
            );
        }, 900);
    });

    // Limpiar errores al escribir
    ['name', 'email', 'message'].forEach(id => {
        const input = document.getElementById(id);
        const err = document.getElementById(`${id}-error`);
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                if (err) err.textContent = '';
            });
        }
    });
}

/* ==========================================================
   9. REVEAL AL HACER SCROLL (INTERSECTION OBSERVER)
   ========================================================== */
function initScrollReveals() {
    const cards = document.querySelectorAll(
        '.skill-category-card, .project-card, .timeline-item, .service-card, .highlight-item, .about-photo-wrapper, .contact-info, .contact-form-container'
    );

    cards.forEach((card, index) => {
        card.classList.add('reveal-on-scroll');
        // Agregar retardo escalonado para grids
        const delayClass = `delay-${(index % 4) + 1}`;
        card.classList.add(delayClass);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(card => observer.observe(card));
}
