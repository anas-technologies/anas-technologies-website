
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("adminToken");
    const message = document.getElementById("dashboardMessage");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

  const apiBase = `${window.ANAS_API_BASE_URL}/api/admin`;

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("adminToken");
        window.location.replace("login.html");
    });

    // Sidebar navigation
    document.querySelectorAll(".nav-item").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            document.querySelectorAll(".dashboard-section").forEach(section => {
                section.hidden = section.id !== button.dataset.section;
            });
        });
    });

    // Fetch data from protected APIs
    async function getData(endpoint) {
        const response = await fetch(`${apiBase}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("adminToken");
            window.location.replace("login.html");
            throw new Error("Your session has expired.");
        }

        if (!response.ok) {
            throw new Error(`Unable to load ${endpoint}.`);
        }

        return response.json();
    }

    // Create table cells safely
    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value == null ? "—" : String(value);
        row.appendChild(cell);
        return cell;
    }

    function formatDate(value) {
        return value ? new Date(value).toLocaleString() : "—";
    }

    // Protected CV download
    async function downloadCV(id, filename) {
        const response = await fetch(`${apiBase}/careers/${id}/cv`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("adminToken");
            window.location.replace("login.html");
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to download CV.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename || "applicant-cv";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    try {
        message.textContent = "Loading dashboard...";

       const [contactData, quoteData, careerData, newsletterData] = await Promise.all([
    getData("contacts"),
    getData("quotes"),
    getData("careers"),
    getData("newsletter")
]);

        const contacts = contactData.contacts;
        const quotes = quoteData.quotes;
        const applications = careerData.applications;
        const subscribers = newsletterData.subscribers;

        // Overview counts
        document.getElementById("contactCount").textContent = contacts.length;
        document.getElementById("quoteCount").textContent = quotes.length;
        document.getElementById("careerCount").textContent = applications.length;
        document.getElementById("newsletterCount").textContent = subscribers.length;

        // Contact messages
        const contactsTable = document.getElementById("contactsTable");

        contacts.forEach(contact => {
            const row = document.createElement("tr");

            addCell(row, contact.name);
            addCell(row, contact.email);
            addCell(row, contact.phone);
            addCell(row, contact.service);
            addCell(row, contact.message);
            addCell(row, formatDate(contact.created_at));

            contactsTable.appendChild(row);
        });

        // Quote requests
        const quotesTable = document.getElementById("quotesTable");

        quotes.forEach(quote => {
            const row = document.createElement("tr");

            addCell(row, quote.fullname);
            addCell(row, quote.email);
            addCell(row, Array.isArray(quote.services)
                ? quote.services.join(", ")
                : quote.services);
            addCell(row, quote.budget);
            addCell(row, quote.timeline);
            addCell(row, quote.details);
            addCell(row, formatDate(quote.created_at));

            quotesTable.appendChild(row);
        });

        // Job applications
        const careersTable = document.getElementById("careersTable");

        applications.forEach(application => {
            const row = document.createElement("tr");

            addCell(row, application.fullname);
            addCell(row, application.email);
            addCell(row, application.phone);
            addCell(row, application.position);
            addCell(row, application.cover_letter);

            const cvCell = document.createElement("td");
            const downloadBtn = document.createElement("button");

            downloadBtn.textContent = "Download CV";
            downloadBtn.type = "button";

            downloadBtn.addEventListener("click", async () => {
                downloadBtn.disabled = true;

                try {
                    await downloadCV(
                        application.id,
                        application.cv_original_name
                    );
                } catch (error) {
                    message.textContent = error.message;
                } finally {
                    downloadBtn.disabled = false;
                }
            });

            cvCell.appendChild(downloadBtn);
            row.appendChild(cvCell);

            addCell(row, formatDate(application.created_at));
            careersTable.appendChild(row);
        });

                // Newsletter subscribers
        const newsletterTable = document.getElementById("newsletterTable");

        subscribers.forEach(subscriber => {
            const row = document.createElement("tr");

            addCell(row, subscriber.id);
            addCell(row, subscriber.email);
            addCell(row, formatDate(subscriber.subscribed_at));

            newsletterTable.appendChild(row);
        });
 

        message.textContent = "";

    } catch (error) {
        message.textContent = error.message || "Unable to load dashboard.";
    }
});
