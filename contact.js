
document.addEventListener("DOMContentLoaded", function () {

    const contactForm = document.getElementById("contactForm");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
         const response = await fetch(`${window.ANAS_API_BASE_URL}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to send message.");
            }

            alert("Your message has been received successfully!");
            contactForm.reset();

        } catch (error) {
            alert(error.message || "Something went wrong. Please try again.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message →";
        }

    });

});
