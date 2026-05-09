document.addEventListener('DOMContentLoaded', () => {

    // ADDING A STYLE TO THE ACTIVE PAGE ON THE WEBSITE
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });

    // NAVIGATION SCROLL EFFECT THAT CHANGES THE BACKGROUND COLOR ON MOBILE SCREENS
    const nav = document.getElementById('mainNav');
    if (nav) {
        const handleScroll = () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // ANIMATION FUNCTION FOR PAGE REVEAL AS USER SCROLLS THROUGH THE WEBSITE
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // FUNCTION THAT CLOSES THE NAVIGATION MENU WHEN A PAGE SECTION IS CLICKED SPECIFICALLY FOR THE HOMEPAGE
    const navCollapse = document.getElementById('navMenu');

    if (navCollapse) {
        const bsCollapse = new bootstrap.Collapse(navCollapse, { toggle: false });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }


    // ANIMATING THE SKILLS BAR PERCENTAGE ON THE HOMEPAGE
    const skillSection = document.querySelector('.skills-bar-card');

    if (skillSection) {
        const Count = (el, from, to, duration, suffix = '%') => {
            const start = performance.now();

            const update = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                el.textContent = Math.round(from + (to - from) * eased) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const bars = entry.target.querySelectorAll('.percentage-column');
                const counters = entry.target.querySelectorAll('.percentage-show');

                bars.forEach((bar, i) => {
                    setTimeout(() => {
                        bar.style.width = bar.dataset.width;
                    }, i * 120);
                });

                counters.forEach((counter, i) => {
                    const target = Number(counter.dataset.target) || 0;

                    setTimeout(() => {
                        Count(counter, 0, target, 1400);
                    }, i * 120);
                });

                obs.unobserve(entry.target);
            });
        }, { threshold: 0.35 });

        observer.observe(skillSection);
    }

    // DUPLICATE THE SKILLS SHOWCASE SECTION ON THE HOMEPAGE
    const ticker = document.querySelector('.ticker-inner');
    if (ticker) {
        ticker.innerHTML += ticker.innerHTML;
    }

    // ADDING CURRENT YEAR TO THE FOOTER PAGE NO MATTER THE CHANGE
    document.querySelectorAll('.js-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    //FUNCTION THAT TAKES THE USER BACK TO THE TOP OF THE PAGE
    window.scrollToTop = function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    //DIRECT USER THAT CLICKS ON THE GET STARTED BUTTON TO THE FORM
    (() => {
        const direct = document.getElementById('Direct');
        const fill = document.getElementById('name');

        if (!direct || !fill) return;

        direct.addEventListener('click', () => {
            fill.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(() => {
                fill.focus();
            }, 500); //TIMEFRAME OF 0.5SEC

            //ADD A SUBTLE GLOW WHEN FORM IS IN VIEW
            setTimeout(() => {
                fill.classList.add('highlight-form');

                //REMOVE SUBTLE GLOW
                setTimeout(() => {
                    fill.classList.remove('highlight-form');
                }, 1200); // TIMEFRAME OF 1.2SEC
            }, 500); //TIMEFRAME OF 0.5SEC
        });
    })();

    // ─── BOOTSTRAP DROPDOWN SELECT ───
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const btn = document.getElementById('serviceDropdown');
            const input = document.getElementById('serviceValue');
            const label = document.getElementById('serviceLabel');

            // Update button text and value
            label.textContent = this.dataset.value;
            input.value = this.dataset.value;

            // Mark selected visually
            btn.classList.add('selected');
            document.querySelectorAll('.dropdown-item')
                .forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    //PREVENTING FORM FROM SUBMITTING BEFORE JS RUNS AND VALIDATE FORM INPUTS
    (() => {
        const form = document.querySelector('form.custom-contact');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault(); // stop page from reloading so javascript can validate and redirect based on the eventlistner function
            const btn = form.querySelector('button[type="submit"]');
            const original = btn?.innerHTML;

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                showAlert('Please fill all fields.', "danger");
                return;
            }

            if (btn) {
                btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
                btn.disabled = true;
            }

            //SUBMIT FORM INFO TO NETLIFY IN THE BACKGROUND CAUSE REDIRECT TO WHATSAPP FUNCTION MIGHT BREAK THE NETLIFY EMAIL SUBMISSION
            fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(new FormData(form)).toString()
            });

            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Message Sent!';
                    btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                }

                showAlert("Email received, you'll be redirected to WhatsApp...", "success");
                sendToWhatsappImmediateOpen();

                setTimeout(() => {
                    if (btn) {
                        btn.innerHTML = original;
                        btn.disabled = false;
                        btn.style.background = '';
                    }
                }, 3000);
            }, 1500);
        });
    })();

    // SEND FORM MESSAGES TO WHATSAPP IMMEDIATELY
    function sendToWhatsappImmediateOpen() {
        let name = document.getElementById('name')?.value || "";
        let email = document.getElementById('email')?.value || "";
        let service = document.getElementById('serviceValue')?.value || "";
        let message = document.getElementById('message')?.value || "";

        // REDIRECTS USER TO WHATSAPP
        const phone_no = "2348106522404";

        const text = `New Project Enquiry

            Name: ${name}
            Email: ${email}
            Service: ${service}

            Message:
            ${message}`;

        const url = `https://wa.me/${phone_no}?text=${encodeURIComponent(text)}`;


        // SET TIMER BEFORE USER IS REDIRECTED
        setTimeout(() => {
            window.location.href = url;
        }, 1000); //1sec before redirecting to the next page
    }


    // CREATE A TOAST ALERT TO SHOW ON THE CONTACT SCREEN
    function showAlert(message, type = "success") {
        // CREATE CONTAINER IF IT DOESN'T EXIST YET
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        //TAKES SVG FROM BOOTSTRAP ICONS IT SELF
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`,
            danger: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`
        };

        const toast = document.createElement('div');
        toast.className = `custom-toast custom-toast--${type}`;
        toast.innerHTML = `
        <span class="custom-toast__icon">${icons[type] || icons.danger}</span>
        <span class="custom-toast__message">${message}</span>
        <button class="custom-toast__close" onclick="this.parentElement.remove()">✕</button>
    `;

        container.appendChild(toast);

        // TRIGGER ENTRANCE TOAST ANIMATION
        requestAnimationFrame(() => toast.classList.add('custom-toast--visible'));

        // AUTO DISMISS AFTER 3.5SEC
        setTimeout(() => {
            toast.classList.remove('custom-toast--visible');
            setTimeout(() => {
                toast.remove();
            }, 400); //4ms before leaving the screen
        }, 3500); // After 3.5s then exit the screen
    }

    // FILTER PROJECT CARDS
    (() => {
        const filterBtns = document.querySelectorAll('.projects .filter-btn');
        const cards = document.querySelectorAll('.projects [data-category]');
        const emptyState = document.getElementById('emptyState');
        const seeAllWrapper = document.getElementById('seeAllWrapper');

        if (!filterBtns.length || !cards.length || !emptyState) return;

        const setVisible = (card, show) => {
            const column = card.closest('.col-md-4') || card;
            column.classList.toggle('hidden', !show);
        };

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                let visible = 0;

                cards.forEach(card => {
                    const match = filter === 'all' || card.dataset.category === filter;
                    setVisible(card, match);
                    if (match) visible++;
                });

                emptyState.style.display = visible === 0 ? 'block' : 'none';
                if (seeAllWrapper) {
                    seeAllWrapper.style.display = visible === 0 ? 'none' : '';
                }
            });
        });
    })();
    
});

