document.addEventListener("DOMContentLoaded", function () {

    // Global Quote Button Navigation
    const quoteButtons = document.querySelectorAll(".quote-btn");

    quoteButtons.forEach(button => {
        button.addEventListener("click", function () {

            if (!window.location.pathname.endsWith("quote.html")) {
                window.location.href = "quote.html";
            }

        });
    });


    // Form Progress Bar Animation
    const quoteForm = document.getElementById("quoteForm");
    const progressBar = document.getElementById("progressBar");


    if (quoteForm && progressBar) {

        quoteForm.addEventListener("input", function () {

            const requiredInputs =
                quoteForm.querySelectorAll("[required]");

            let completed = 0;


            requiredInputs.forEach(input => {

                if (input.value.trim() !== "") {
                    completed++;
                }

            });


            const progress = Math.min(
                100,
                Math.max(
                    20,
                    (completed / requiredInputs.length) * 100
                )
            );

            progressBar.style.width = `${progress}%`;

        });


        // Form Submit Handler
        quoteForm.addEventListener("submit", function (e) {

            e.preventDefault();


            const name =
                document.getElementById("fullname").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const details =
                document.getElementById("details").value.trim();


            if (!name || !email || !details) {

                alert(
                    "Please fill in all mandatory fields."
                );

                return;
            }


            const submitBtn =
                document.getElementById("submitBtn");


            submitBtn.innerText =
                "Submitting Request...";

            submitBtn.disabled = true;


            setTimeout(() => {

                alert(
                    `Thank you, ${name}! Your quote request has been submitted successfully. An ANAS Technologies specialist will review your request and get back to you within 1 business day.`
                );


                quoteForm.reset();

                progressBar.style.width = "20%";

                submitBtn.innerText =
                    "Submit Quote Request →";

                submitBtn.disabled = false;

            }, 1200);

        });

    }

});


/* ==========================================
   RESPONSIVE MOBILE NAVIGATION
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const navbar =
        document.querySelector(".navbar");


    const navLinks = navbar
        ? navbar.querySelector(".nav-links")
        : null;


    /* Stop if navbar doesn't exist */

    if (!navbar || !navLinks) {
        return;
    }


    /* Prevent duplicate hamburger buttons */

    if (navbar.querySelector(".mobile-menu-toggle")) {
        return;
    }


    /* Create hamburger button */

    const toggle =
        document.createElement("button");


    toggle.className =
        "mobile-menu-toggle";


    toggle.type =
        "button";


    toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
    );


    toggle.setAttribute(
        "aria-expanded",
        "false"
    );


    /* Three hamburger lines */

    toggle.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;


    /* Add hamburger to navbar */

    navbar.appendChild(toggle);


    /* Function for closing menu */

    function closeMenu() {

        navLinks.classList.remove(
            "mobile-open"
        );


        toggle.setAttribute(
            "aria-expanded",
            "false"
        );


        toggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    }


    /* Open / close hamburger */

    toggle.addEventListener(
        "click",
        function () {

            const opening =
                !navLinks.classList.contains(
                    "mobile-open"
                );


            navLinks.classList.toggle(
                "mobile-open",
                opening
            );


            toggle.setAttribute(
                "aria-expanded",
                opening ? "true" : "false"
            );


            toggle.setAttribute(
                "aria-label",
                opening
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

        }
    );


    /* Close menu after clicking a link */

    navLinks.addEventListener(
        "click",
        function (event) {

            if (
                event.target.closest("a")
            ) {

                closeMenu();

            }

        }
    );


    /* Close when clicking outside navbar */

    document.addEventListener(
        "click",
        function (event) {

            if (
                window.innerWidth <= 900 &&
                !navbar.contains(event.target)
            ) {

                closeMenu();

            }

        }
    );


    /* Reset menu when moving back to desktop */

    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 900
            ) {

                closeMenu();

            }

        }
    );

});


/* ==========================================
   PROJECT TABS
   SHOEHUB / FITTRACK / BIZFLOW
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const projectTabs = Array.from(
        document.querySelectorAll(
            '.an-project-tabs [role="tab"]'
        )
    );


    const projectCount =
        document.querySelector(
            '.an-project-count'
        );


    /* Stop if project tabs do not exist */

    if (projectTabs.length === 0) {
        return;
    }


    /* Show selected project */

    function showProject(index) {

        projectTabs.forEach(
            function (tab, i) {

                const isActive =
                    i === index;


                tab.setAttribute(
                    "aria-selected",
                    String(isActive)
                );


                tab.tabIndex =
                    isActive ? 0 : -1;


                const panelId =
                    tab.getAttribute(
                        "aria-controls"
                    );


                const panel =
                    document.getElementById(
                        panelId
                    );


                if (panel) {

                    panel.hidden =
                        !isActive;

                }

            }
        );


        /* Update project counter */

        if (projectCount) {

            projectCount.textContent =
                `${String(index + 1).padStart(2, "0")} / ${String(projectTabs.length).padStart(2, "0")}`;

        }

    }


    /* Tab Events */

    projectTabs.forEach(
        function (tab, index) {


            /* Mouse Click */

            tab.addEventListener(
                "click",
                function () {

                    showProject(index);

                }
            );


            /* Keyboard Navigation */

            tab.addEventListener(
                "keydown",
                function (event) {

                    let nextIndex;


                    /* Next project */

                    if (
                        event.key ===
                        "ArrowRight"
                    ) {

                        nextIndex =
                            (index + 1) %
                            projectTabs.length;

                    }


                    /* Previous project */

                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {

                        nextIndex =
                            (
                                index - 1 +
                                projectTabs.length
                            ) %
                            projectTabs.length;

                    }


                    /* First project */

                    if (
                        event.key ===
                        "Home"
                    ) {

                        nextIndex = 0;

                    }


                    /* Last project */

                    if (
                        event.key ===
                        "End"
                    ) {

                        nextIndex =
                            projectTabs.length - 1;

                    }


                    /* Change project */

                    if (
                        nextIndex !==
                        undefined
                    ) {

                        event.preventDefault();


                        showProject(
                            nextIndex
                        );


                        projectTabs[
                            nextIndex
                        ].focus();

                    }

                }
            );

        }
    );


    /* Make sure first selected project is displayed */

    const activeIndex =
        projectTabs.findIndex(
            tab =>
                tab.getAttribute(
                    "aria-selected"
                ) === "true"
        );


    showProject(
        activeIndex >= 0
            ? activeIndex
            : 0
    );

});

/* ==========================================
   LIFE AT ANAS MOBILE SWIPE CAROUSEL
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const slider =
        document.querySelector(".life-cards-wrapper");

    const cards =
        document.querySelectorAll(".life-cards-wrapper .life-card");

    const dots =
        document.querySelectorAll(".life-slider-dots .dot");


    if (!slider || !cards.length || !dots.length) {
        return;
    }


    function updateDots() {

        const cardWidth =
            slider.clientWidth;

        if (!cardWidth) {
            return;
        }


        const currentIndex =
            Math.round(
                slider.scrollLeft / cardWidth
            );


        dots.forEach(function (dot, index) {

            dot.classList.toggle(
                "active",
                index === currentIndex
            );

        });

    }


    slider.addEventListener(
        "scroll",
        function () {

            window.requestAnimationFrame(
                updateDots
            );

        }
    );


    dots.forEach(function (dot, index) {

        dot.addEventListener(
            "click",
            function () {

                slider.scrollTo({
                    left:
                        slider.clientWidth * index,

                    behavior: "smooth"
                });

            }
        );

    });


    window.addEventListener(
        "resize",
        updateDots
    );


    updateDots();

});
