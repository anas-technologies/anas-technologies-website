
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminLoginForm");
    const passwordInput = document.getElementById("adminPassword");
    const loginBtn = document.getElementById("loginBtn");
    const message = document.getElementById("loginMessage");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const password = passwordInput.value;

        if (!password) {
            message.textContent = "Please enter your admin password.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";
        message.textContent = "";

        try {
            const response = await fetch(`${window.ANAS_API_BASE_URL}/api/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Login failed.");
            }

            // Keep the token for this browser tab only
            sessionStorage.setItem("adminToken", result.token);

            // Redirect to dashboard after successful login
            window.location.href = "dashboard.html";

        } catch (error) {
            message.textContent = error.message || "Unable to log in.";
            passwordInput.value = "";
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";
        }
    });
});
    
