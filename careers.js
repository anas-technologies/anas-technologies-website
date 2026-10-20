
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("applyForm");

    
    // ========================================
    // CV UPLOAD VISUAL CONFIRMATION
    // ========================================

    const cvInput = document.getElementById("cvUpload");
    const cvBox = document.getElementById("cvUploadBox");
    const cvIcon = document.getElementById("cvUploadIcon");
    const cvTitle = document.getElementById("cvUploadTitle");
    const cvDescription = document.getElementById("cvUploadDescription");
    const cvInfo = document.getElementById("cvUploadInfo");

    cvInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const extension = file.name.split(".").pop().toLowerCase();

        const allowedTypes = ["pdf", "doc", "docx"];

        if (!allowedTypes.includes(extension) || file.size > 5 * 1024 * 1024) {

            cvInput.value = "";

            cvBox.classList.remove("cv-selected");

            cvTitle.textContent = "Invalid CV file";
            cvDescription.textContent =
                "Please select a PDF, DOC or DOCX file under 5 MB.";

            cvInfo.textContent = "Click to choose another file";

            return;
        }

        // Update the upload box appearance
        cvBox.classList.add("cv-selected");

        cvIcon.innerHTML = `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round"
                 aria-hidden="true">
                <path d="M20 6 9 17l-5-5"></path>
            </svg>
        `;

        cvTitle.textContent = file.name;

        cvDescription.textContent = "✓ CV selected successfully";

        cvInfo.textContent =
            extension.toUpperCase() +
            " • " +
            (file.size / 1024 / 1024).toFixed(2) +
            " MB • Click to change file";
    });


    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const data = new FormData();

        const inputs = form.querySelectorAll("input");
        const position = form.querySelector("select");
        const coverLetter = form.querySelector("textarea");
        const cvFile = document.getElementById("cvUpload").files[0];

        if (!cvFile) {
            alert("Please upload your CV.");
            return;
        }

        if (cvFile.size > 5 * 1024 * 1024) {
            alert("Your CV must be 5 MB or smaller.");
            return;
        }

        const extension = cvFile.name.split(".").pop().toLowerCase();

        if (!["pdf", "doc", "docx"].includes(extension)) {
            alert("Only PDF, DOC and DOCX files are allowed.");
            return;
        }

        data.append("fullname", inputs[0].value.trim());
        data.append("email", inputs[1].value.trim());
        data.append("phone", inputs[2].value.trim());
        data.append("position", position.value);
        data.append("cv", cvFile);
        data.append("cover_letter", coverLetter.value.trim());

        const button = form.querySelector(".submit-app-btn");
        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Submitting...";

        try {
          const response = await fetch(`${window.ANAS_API_BASE_URL}/api/careers`, {
                method: "POST",
                body: data
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Submission failed.");
            }

            alert("Your job application has been submitted successfully!");
            form.reset();

        } catch (error) {
            alert(error.message || "Unable to submit your application.");
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
});
