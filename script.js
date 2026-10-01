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
            const requiredInputs = quoteForm.querySelectorAll("[required]");
            let completed = 0;

            requiredInputs.forEach(input => {
                if (input.value.trim() !== "") {
                    completed++;
                }
            });

            const progress = Math.min(100, Math.max(20, (completed / requiredInputs.length) * 100));
            progressBar.style.width = `${progress}%`;
        });

        // Form Submit Handler
        quoteForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim();
            const details = document.getElementById("details").value.trim();

            if (!name || !email || !details) {
                alert("Please fill in all mandatory fields.");
                return;
            }

            const submitBtn = document.getElementById("submitBtn");
            submitBtn.innerText = "Submitting Request...";
            submitBtn.disabled = true;

            setTimeout(() => {
                alert(`Thank you, ${name}! Your quote request has been submitted successfully. An ANAS Technologies specialist will review your request and get back to you within 1 business day.`);
                quoteForm.reset();
                progressBar.style.width = "20%";
                submitBtn.innerText = "Submit Quote Request →";
                submitBtn.disabled = false;
            }, 1200);
        });
    }
});