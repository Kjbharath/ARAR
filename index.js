/* ============================================
   ARAR GROUP — Premium EPC Portal
   Interactive Functionality
   ============================================ */

/* ---- Visibility-gate helper ----
   Wraps requestAnimationFrame so all animation loops
   automatically pause when the tab is hidden and
   resume when it becomes visible again.              */
let _pageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => {
    _pageVisible = !document.hidden;
});

function rafLoop(fn) {
    let rafId;
    function tick(ts) {
        if (_pageVisible) fn(ts);
        rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId); // returns a cancel fn
}


document.addEventListener('DOMContentLoaded', () => {

    // ---- Sticky Navigation ----
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 80;

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check on load


    // ---- Mobile Navigation ----
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

    function closeMobileNav() {
        if (!hamburger || !mobileNav) return;
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // BUG-08 FIX: Close nav on ALL link clicks (including external target="_blank")
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Small delay so the browser can start opening the new tab first
                setTimeout(closeMobileNav, 50);
            });
        });
    }


    // ---- Companies Dropdown (click toggle + outside-click close) ----
    const navDropdown = document.getElementById('navCompaniesDropdown');
    const navTrigger  = document.getElementById('navCompaniesTrigger');
    const navPanel    = document.getElementById('navCompaniesPanel');

    if (navTrigger && navPanel) {
        navTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navPanel.classList.toggle('open');
            navTrigger.classList.toggle('open', isOpen);
            navTrigger.setAttribute('aria-expanded', isOpen);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navDropdown && !navDropdown.contains(e.target)) {
                navPanel.classList.remove('open');
                navTrigger.classList.remove('open');
                navTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                navPanel.classList.remove('open');
                navTrigger.classList.remove('open');
                navTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ---- Mobile Companies Accordion ----
    const mobileCompanies = document.querySelector('.mobile-companies');
    const mobileCompaniesTrigger = document.getElementById('mobileCompaniesTrigger');
    const mobileCompaniesList    = document.getElementById('mobileCompaniesList');

    if (mobileCompaniesTrigger && mobileCompaniesList) {
        mobileCompaniesTrigger.addEventListener('click', () => {
            mobileCompanies.classList.toggle('open');
        });
    }


    // ---- Scroll Animations (Intersection Observer) ----
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));


    // ---- Animated Counters ----
    // BUG-07 FIX: Use a per-section observer so multiple .stats sections each trigger independently
    const counters = document.querySelectorAll('.counter');

    function animateCountersIn(sectionEl) {
        const sectionCounters = sectionEl.querySelectorAll('.counter');
        sectionCounters.forEach(counter => {
            if (counter.dataset.animated) return; // already done
            counter.dataset.animated = '1';
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(timestamp) {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                counter.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    const statsSections = document.querySelectorAll('.stats');
    statsSections.forEach(section => {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCountersIn(entry.target);
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        sectionObserver.observe(section);
    });


    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ---- Parallax Effect for Stats Background ----
    const statsBg = document.querySelector('.stats-bg');
    const statsSection = document.querySelector('.stats');
    if (statsBg && statsSection) {
        window.addEventListener('scroll', () => {
            if (!_pageVisible) return;
            const scrolled = window.pageYOffset;
            const statsRect = statsSection.getBoundingClientRect();
            if (statsRect.top < window.innerHeight && statsRect.bottom > 0) {
                const speed = 0.3;
                const yPos = -(scrolled * speed);
                statsBg.style.transform = `translateY(${yPos}px)`;
            }
        }, { passive: true });
    }


    // ---- Active Nav Link Highlighting ----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

    window.addEventListener('scroll', () => {
        if (!_pageVisible) return;
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('nav-active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('nav-active');
            }
        });
    }, { passive: true });


    // ---- About Section Scroll Gallery ----
    function initGallery(galleryId, trackId, dotsId) {
        const gallery = document.getElementById(galleryId);
        if (!gallery) return;
        const slides = gallery.querySelectorAll('.about-gallery-slide');
        const dots   = gallery.querySelectorAll('.about-gallery-dot');
        let current  = 0;
        const total  = slides.length;
        let scrollCooldown = false;
        let autoPlayInterval = null;

        function goTo(index) {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            current = (index + total) % total;
            slides[current].classList.add('active');
            if (dots[current]) dots[current].classList.add('active');
        }

        if (total === 0) return;

        // BUG-03 FIX: Only preventDefault when we are not at a boundary
        // Also uses { passive: false } only for this element
        gallery.addEventListener('wheel', (e) => {
            const atStart = current === 0 && e.deltaY < 0;
            const atEnd   = current === total - 1 && e.deltaY > 0;
            if (atStart || atEnd) return; // let page scroll normally

            e.preventDefault();
            e.stopPropagation();

            if (scrollCooldown) return;
            scrollCooldown = true;

            if (e.deltaY > 0) {
                goTo(current + 1);
            } else {
                goTo(current - 1);
            }
            setTimeout(() => { scrollCooldown = false; }, 500);
        }, { passive: false });

        // Dot click navigation
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const target = parseInt(dot.getAttribute('data-index'));
                if (target !== current) goTo(target);
            });
        });

        // Radius-on-scroll effect
        const startRadius = 0;
        const endRadius = 48;
        function updateRadius() {
            const rect = gallery.getBoundingClientRect();
            const windowH = window.innerHeight;
            const triggerStart = windowH;
            const triggerEnd = windowH * 0.3;
            const progress = Math.min(Math.max(
                (triggerStart - rect.top) / (triggerStart - triggerEnd),
                0), 1);
            gallery.style.borderRadius = (startRadius + (endRadius - startRadius) * progress) + 'px';
        }
        window.addEventListener('scroll', updateRadius, { passive: true });
        updateRadius();

        // BUG-04 FIX: Store interval, pause on hover + tab hide
        function startAutoPlay() {
            if (autoPlayInterval) return;
            autoPlayInterval = setInterval(() => {
                if (_pageVisible) goTo(current + 1);
            }, 4000);
        }
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }

        gallery.addEventListener('mouseenter', stopAutoPlay);
        gallery.addEventListener('mouseleave', startAutoPlay);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoPlay(); else startAutoPlay();
        });

        startAutoPlay();
    }

    initGallery('aboutGallery',   'aboutGalleryTrack',   'aboutGalleryDots');
    initGallery('utilityGallery', 'utilityGalleryTrack', 'utilityGalleryDots');


    // ---- Mouse Trail ----
    const trailDots = [];
    const numDots = 12;

    for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'mouse-trail-dot';
        dot.setAttribute('aria-hidden', 'true'); // A11Y-07 FIX
        document.body.appendChild(dot);
        trailDots.push({
            element: dot,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // PERF-01 FIX: use rafLoop so trail pauses when tab is hidden
    rafLoop(() => {
        let x = mouseX;
        let y = mouseY;

        trailDots.forEach((dot, index) => {
            const nextDot = trailDots[index + 1] || trailDots[0];
            dot.x = x;
            dot.y = y;

            const scale = 1 - (index / numDots);
            dot.element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            dot.element.style.opacity = scale * 0.6;

            x += (nextDot.x - x) * 0.35;
            y += (nextDot.y - y) * 0.35;
        });
    });


    // ---- Back to Top Button ----
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ---- Electric Cables Canvas ----
    (function initElectricCables() {
        const canvas = document.getElementById('logoDroplets') || document.getElementById('utilityElecCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const CFG = {
            count: 6,
            thickness: 45,
            pulseSpeed: 400,
            pulseLength: 350,
            cableBase: [20, 20, 20],
            cableHighlight: [70, 70, 70],
            cableGroove: [10, 10, 10],
            elecCore: [180, 220, 255],
            elecGlow: [0, 80, 180]
        };

        function resize() {
            const s = canvas.parentElement;
            canvas.width  = s.offsetWidth;
            canvas.height = s.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // BUG-05 FIX: Separate the generation seed from the draw-time PRNG.
        // drawSeed is used exclusively during draw (jitter) and reset each frame
        // so it never contaminates the generationSeed.
        let generationSeed = 42;
        let drawSeed = 0;

        function seededRandom(seedRef) {
            let t = seedRef.value += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }

        function genRand(min, max) {
            return seededRandom({ value: generationSeed, get value() { return generationSeed; }, set value(v) { generationSeed = v; } }) * (max - min) + min;
        }

        // Simpler wrapper objects so we can pass by reference
        const genSeedRef  = { value: 42 };
        const drawSeedRef = { value: 0 };

        function rand(min, max, ref) {
            return seededRandom(ref) * (max - min) + min;
        }

        function rgba(rgb, a) {
            return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.min(1, Math.max(0, a))})`;
        }

        const cables = [];

        function generateCables() {
            genSeedRef.value = 42; // Reset only the generation seed
            cables.length = 0;
            const w = canvas.width;
            const h = canvas.height;

            for (let i = 0; i < CFG.count; i++) {
                const startX = rand(w * 0.1, w * 0.8, genSeedRef);
                const startY = -200;
                const endX   = startX - rand(w * 0.2, w * 0.6, genSeedRef);
                const endY   = h + 200;
                const cp1x   = startX + rand(-200, 200, genSeedRef);
                const cp1y   = h * 0.3;
                const cp2x   = endX + rand(-200, 200, genSeedRef);
                const cp2y   = h * 0.7;

                const pts = [];
                const steps = 150;
                let totalLen = 0;

                for (let t = 0; t <= steps; t++) {
                    const pct = t / steps;
                    const u = 1 - pct;
                    const x = u*u*u*startX + 3*u*u*pct*cp1x + 3*u*pct*pct*cp2x + pct*pct*pct*endX;
                    const y = u*u*u*startY + 3*u*u*pct*cp1y + 3*u*pct*pct*cp2y + pct*pct*pct*endY;

                    let dx = 0, dy = 1;
                    if (t > 0) {
                        dx = x - pts[t - 1].x;
                        dy = y - pts[t - 1].y;
                        totalLen += Math.sqrt(dx * dx + dy * dy);
                    }

                    const angle = Math.atan2(dy, dx);
                    const nx = Math.cos(angle + Math.PI / 2);
                    const ny = Math.sin(angle + Math.PI / 2);

                    pts.push({ x, y, len: totalLen, nx, ny, angle });
                }

                cables.push({
                    pts,
                    totalLen,
                    thickness: rand(CFG.thickness * 0.8, CFG.thickness * 1.2, genSeedRef),
                    pulseDist: rand(0, totalLen, genSeedRef),
                    speed: CFG.pulseSpeed * rand(0.8, 1.2, genSeedRef),
                    depth: rand(0.6, 1.2, genSeedRef)
                });
            }
        }

        generateCables();
        let lastW = canvas.width;
        window.addEventListener('resize', () => {
            if (Math.abs(canvas.width - lastW) > 100) {
                generateCables();
                lastW = canvas.width;
            }
        });

        let last = null;
        // PERF-01 FIX: use rafLoop so cable animation pauses when tab hidden
        rafLoop((ts) => {
            if (!last) last = ts;
            const dt = (ts - last) / 1000;
            last = ts;

            ctx.fillStyle = '#010101';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // BUG-05 FIX: reset drawSeedRef each frame so jitter is consistent
            drawSeedRef.value = 1337;

            cables.forEach(c => {
                c.pulseDist += c.speed * dt;
                if (c.pulseDist - CFG.pulseLength > c.totalLen + 200) {
                    c.pulseDist = -CFG.pulseLength;
                }

                const pts = c.pts;
                if (pts.length < 2) return;

                // 1. Shadow
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y + 30 * c.depth);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y + 30 * c.depth);
                }
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = c.thickness;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.filter = `blur(${15 * c.depth}px)`;
                ctx.stroke();
                ctx.filter = 'none';

                // 2. Base Cable Tube
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.strokeStyle = rgba(CFG.cableBase, 1);
                ctx.lineWidth = c.thickness;
                ctx.stroke();

                // 3. Corrugated Texture
                const ribSpacing = 8;
                ctx.lineWidth = 3;
                ctx.strokeStyle = rgba(CFG.cableGroove, 0.9);
                for (let i = 0; i < pts.length; i++) {
                    if (Math.floor(pts[i].len) % ribSpacing < 2) {
                        const p = pts[i];
                        const hw = c.thickness * 0.45;
                        ctx.beginPath();
                        ctx.moveTo(p.x - p.nx * hw, p.y - p.ny * hw);
                        ctx.lineTo(p.x + p.nx * hw, p.y + p.ny * hw);
                        ctx.stroke();
                    }
                }

                // 4. Highlight
                ctx.beginPath();
                ctx.moveTo(pts[0].x - pts[0].nx * c.thickness * 0.2, pts[0].y - pts[0].ny * c.thickness * 0.2);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x - pts[i].nx * c.thickness * 0.2, pts[i].y - pts[i].ny * c.thickness * 0.2);
                }
                ctx.strokeStyle = rgba(CFG.cableHighlight, 0.15);
                ctx.lineWidth = c.thickness * 0.3;
                ctx.stroke();

                // 5. Electricity Surge
                const pStart = c.pulseDist - CFG.pulseLength;
                const pEnd   = c.pulseDist;

                if (pEnd > 0 && pStart < c.totalLen) {
                    const surgePts = pts.filter(p => p.len >= pStart && p.len <= pEnd);

                    if (surgePts.length > 1) {
                        ctx.globalCompositeOperation = 'lighter';

                        // Wide glow
                        ctx.beginPath();
                        ctx.moveTo(surgePts[0].x, surgePts[0].y);
                        for (let i = 1; i < surgePts.length; i++) ctx.lineTo(surgePts[i].x, surgePts[i].y);
                        ctx.strokeStyle = rgba(CFG.elecGlow, 0.6);
                        ctx.lineWidth = c.thickness * 2.5;
                        ctx.filter = 'blur(12px)';
                        ctx.stroke();

                        // Inner glow
                        ctx.beginPath();
                        ctx.moveTo(surgePts[0].x, surgePts[0].y);
                        for (let i = 1; i < surgePts.length; i++) ctx.lineTo(surgePts[i].x, surgePts[i].y);
                        ctx.strokeStyle = rgba(CFG.elecGlow, 0.9);
                        ctx.lineWidth = c.thickness * 1.2;
                        ctx.filter = 'blur(4px)';
                        ctx.stroke();

                        // Core spark with jitter (BUG-05 FIX: uses isolated drawSeedRef)
                        ctx.strokeStyle = rgba(CFG.elecCore, 1);
                        ctx.lineWidth = c.thickness * 0.25;
                        ctx.filter = 'none';
                        ctx.beginPath();
                        ctx.moveTo(surgePts[0].x, surgePts[0].y);
                        for (let i = 1; i < surgePts.length; i++) {
                            const jx = rand(-2, 2, drawSeedRef);
                            const jy = rand(-2, 2, drawSeedRef);
                            ctx.lineTo(surgePts[i].x + jx, surgePts[i].y + jy);
                        }
                        ctx.stroke();

                        ctx.globalCompositeOperation = 'source-over';
                        ctx.filter = 'none';
                    }
                }
            });
        });

    })();


    // ---- Subsidiaries Radial Flow Diagram ----
    (function initRadialFlow() {
        const svg      = document.getElementById('radialFlowSvg');
        const root     = document.getElementById('rfRoot');
        const children = document.querySelectorAll('.rf-child');
        if (!svg || !root || !children.length) return;

        const branchColors = { utility: '#ffc832', petro: '#50a0ff', infra: '#50dc82' };
        let flowPaths = [];
        let isColumnLayout = false;

        function getBBox(el) {
            const wRect = svg.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return { left: r.left - wRect.left, top: r.top - wRect.top, w: r.width, h: r.height };
        }

        function rightMid(el) { const b = getBBox(el); return { x: b.left + b.w, y: b.top + b.h / 2 }; }
        function leftMid(el)  { const b = getBBox(el); return { x: b.left,       y: b.top + b.h / 2 }; }

        function cubicD(x1, y1, x2, y2) {
            const cx = x1 + (x2 - x1) * 0.6;
            return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
        }

        function mkel(tag, attrs) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
            return el;
        }

        function drawConnectors() {
            while (svg.firstChild) svg.removeChild(svg.firstChild);
            flowPaths = [];

            const wrapper = document.querySelector('.radial-flow-wrapper');
            isColumnLayout = !wrapper || getComputedStyle(wrapper).flexDirection === 'column';
            if (isColumnLayout) return;

            const from = rightMid(root);

            children.forEach((child, i) => {
                const branch = child.dataset.branch;
                const color  = branchColors[branch] || '#D22630';
                const to = leftMid(child);
                const d  = cubicD(from.x, from.y, to.x, to.y);

                svg.appendChild(mkel('path', { d, fill: 'none', stroke: 'rgba(255,255,255,0.07)', 'stroke-width': '2', 'stroke-linecap': 'round' }));
                svg.appendChild(mkel('path', { d, fill: 'none', stroke: color, 'stroke-width': '2', opacity: '0.2', 'stroke-linecap': 'round' }));
                const pulse = mkel('path', { d, fill: 'none', stroke: color, 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-dasharray': '16 400', 'stroke-dashoffset': '400', opacity: '0.9' });
                svg.appendChild(pulse);
                flowPaths.push({ el: pulse, branch, color, offset: 400 - i * 133 });
            });
        }

        let lastTs2;
        // PERF-01 FIX: use rafLoop + BUG-06 FIX: guard against column layout
        rafLoop((ts) => {
            if (isColumnLayout || !flowPaths.length) return;
            if (!lastTs2) lastTs2 = ts;
            const dt = ts - lastTs2;
            lastTs2 = ts;
            flowPaths.forEach(p => {
                p.offset -= dt * 0.35;
                if (p.offset < -16) p.offset = 416;
                p.el.setAttribute('stroke-dashoffset', p.offset.toFixed(1));
            });
        });

        function setupBranchHover() {
            children.forEach((child, i) => {
                child.addEventListener('mouseenter', () => {
                    if (flowPaths[i]) { flowPaths[i].el.setAttribute('stroke-width', '5'); flowPaths[i].el.setAttribute('opacity', '1'); }
                    const all = svg.querySelectorAll('path');
                    const gi = i * 3 + 1;
                    if (all[gi]) { all[gi].setAttribute('opacity', '0.65'); all[gi].setAttribute('stroke-width', '4'); }
                });
                child.addEventListener('mouseleave', () => {
                    if (flowPaths[i]) { flowPaths[i].el.setAttribute('stroke-width', '3'); flowPaths[i].el.setAttribute('opacity', '0.9'); }
                    const all = svg.querySelectorAll('path');
                    const gi = i * 3 + 1;
                    if (all[gi]) { all[gi].setAttribute('opacity', '0.2'); all[gi].setAttribute('stroke-width', '2'); }
                });
            });
        }

        let rfTimer;
        window.addEventListener('resize', () => { clearTimeout(rfTimer); rfTimer = setTimeout(drawConnectors, 150); });

        drawConnectors();
        setupBranchHover();
        setTimeout(drawConnectors, 500);
        setTimeout(drawConnectors, 1200);

    })();


    // ---- Zoom-Into-Logo Transition ----
    (function initZoomTransition() {
        const introSection = document.getElementById('logo-intro');
        const logoWrap     = document.getElementById('logo3dWrap');
        const overlay      = document.getElementById('zoomOverlay');
        const nextSection  = document.getElementById('showcase');

        if (!introSection || !logoWrap || !overlay || !nextSection) return;

        let isTransitioning = false;
        let hasTransitioned = false;
        let overlayTimer    = null; // BUG-01 FIX: store timer so we can cancel it
        let resetTimer      = null;
        let safetyTimer     = null;

        function clearAllTimers() {
            clearTimeout(overlayTimer);
            clearTimeout(resetTimer);
            clearTimeout(safetyTimer);
            overlayTimer = resetTimer = safetyTimer = null;
        }

        function resetZoomState() {
            clearAllTimers();
            hasTransitioned = false;
            isTransitioning = false;
            logoWrap.style.transition  = 'none';
            logoWrap.style.transform   = '';
            logoWrap.style.animation   = '';
            logoWrap.style.borderRadius = '';
            introSection.classList.remove('zoom-transitioning');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }

        function triggerZoom() {
            if (isTransitioning || hasTransitioned) return;
            if (window.scrollY > 20) return;

            isTransitioning = true;
            document.body.style.overflow = 'hidden';

            introSection.classList.add('zoom-transitioning');
            logoWrap.style.animation = 'none';
            void logoWrap.offsetHeight; // force reflow

            logoWrap.style.transform = 'scale(18)';

            // BUG-01 FIX: store overlayTimer so it can be cancelled
            overlayTimer = setTimeout(() => { overlay.classList.add('visible'); }, 480);

            resetTimer = setTimeout(() => {
                hasTransitioned = true;
                clearTimeout(overlayTimer);

                nextSection.scrollIntoView({ behavior: 'instant', block: 'start' });

                introSection.classList.remove('zoom-transitioning');
                logoWrap.style.transition   = 'none';
                logoWrap.style.transform    = '';
                logoWrap.style.animation    = '';
                logoWrap.style.borderRadius = '';
                document.body.style.overflow = '';

                requestAnimationFrame(() => { overlay.classList.remove('visible'); });

                isTransitioning = false;
            }, 920);

            // Safety net
            safetyTimer = setTimeout(() => {
                if (document.body.style.overflow === 'hidden') {
                    document.body.style.overflow = '';
                    isTransitioning = false;
                }
            }, 1500);
        }

        // BUG-02 FIX: Reset state when returning via browser Back (bfcache)
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                resetZoomState();
            }
        });

        // Reset state when user scrolls back to top
        window.addEventListener('scroll', () => {
            if (window.scrollY < 5) {
                resetZoomState();
            }
        }, { passive: true });

        // Mouse wheel / trackpad
        introSection.addEventListener('wheel', (e) => {
            if (hasTransitioned || isTransitioning || window.scrollY > 20) return;
            if (e.deltaY > 0) { e.preventDefault(); triggerZoom(); }
        }, { passive: false });

        // Touch swipe up
        let touchStartY = 0;
        introSection.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        introSection.addEventListener('touchmove', (e) => {
            if (hasTransitioned || isTransitioning || window.scrollY > 20) return;
            if (touchStartY - e.touches[0].clientY > 30) { e.preventDefault(); triggerZoom(); }
        }, { passive: false });

        // Keyboard: Arrow Down, Page Down, Space
        document.addEventListener('keydown', (e) => {
            if (hasTransitioned || isTransitioning || window.scrollY > 20) return;
            if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); triggerZoom(); }
        });

    })();


});
