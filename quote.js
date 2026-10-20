
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("quoteForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const services = Array.from(
            form.querySelectorAll('input[name="services"]:checked')
        ).map(input => input.value);

        const data = {
            services,
            budget: document.getElementById("budget").value,
            timeline: document.getElementById("timeline").value,
            details: document.getElementById("details").value.trim(),
            fullname: document.getElementById("fullname").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            company: document.getElementById("company").value.trim()
        };

        if (
            services.length === 0 ||
            !data.budget ||
            !data.timeline ||
            !data.details ||
            !data.fullname ||
            !data.email
        ) {
            alert("Please complete all required fields.");
            return;
        }

        if (!document.getElementById("email").checkValidity()) {
            alert("Please enter a valid email address.");
            return;
        }

        const button = document.getElementById("submitBtn");
        button.disabled = true;
        button.textContent = "Submitting...";

        try {
           const response = await fetch(`${window.ANAS_API_BASE_URL}/api/quote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Submission failed.");
            }

            alert("Your quote request has been submitted successfully!");
            form.reset();

            const progressBar = document.getElementById("progressBar");
            if (progressBar) {
                progressBar.style.width = "0%";
            }

        } catch (error) {
            alert(error.message || "Unable to submit your request.");
        } finally {
            button.disabled = false;
            button.innerHTML = 'Submit Quote Request <span class="btn-arrow">→</span>';
        }
    });
});
