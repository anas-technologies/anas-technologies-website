const express = require("express");
const { Resend } = require("resend");

const router = express.Router();

// Resend API
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            topic,
            message
        } = req.body;

        // Required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required."
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Optional fields
        const safePhone = phone || "Not provided";
        const safeTopic = topic || "Not specified";

        // Check Resend API key
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is missing.");

            return res.status(500).json({
                success: false,
                message: "Email service is not configured."
            });
        }

        // Send email through Resend
        const { data, error } = await resend.emails.send({
            from: "ANAS Technologies <onboarding@resend.dev>",
            to: [
                process.env.CONTACT_RECEIVER_EMAIL ||
                "anastechnologies32@gmail.com"
            ],
            replyTo: email,
            subject: `New Website Contact Message - ${name}`,

            text: [
                "New contact form submission",
                "",
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${safePhone}`,
                `Topic: ${safeTopic}`,
                "",
                "Message:",
                message
            ].join("\n"),

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #222;
                    max-width: 700px;
                    margin: 0 auto;
                ">

                    <h2 style="
                        color: #f97316;
                        margin-bottom: 20px;
                    ">
                        New Website Contact Message
                    </h2>

                    <table style="
                        border-collapse: collapse;
                        width: 100%;
                        margin-bottom: 25px;
                    ">

                        <tr>
                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                                width: 150px;
                            ">
                                <strong>Name</strong>
                            </td>

                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                ${escapeHtml(name)}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                <strong>Email</strong>
                            </td>

                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                ${escapeHtml(email)}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                <strong>Phone</strong>
                            </td>

                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                ${escapeHtml(safePhone)}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                <strong>Topic</strong>
                            </td>

                            <td style="
                                padding: 10px;
                                border: 1px solid #ddd;
                            ">
                                ${escapeHtml(safeTopic)}
                            </td>
                        </tr>

                    </table>

                    <h3 style="margin-bottom: 10px;">
                        Message
                    </h3>

                    <div style="
                        padding: 15px;
                        background: #f7f7f7;
                        border-left: 4px solid #f97316;
                        white-space: pre-wrap;
                        border-radius: 4px;
                    ">
                        ${escapeHtml(message)}
                    </div>

                    <p style="
                        margin-top: 25px;
                        color: #777;
                        font-size: 13px;
                    ">
                        This message was submitted through the
                        ANAS Technologies website contact form.
                    </p>

                </div>
            `
        });

        // Resend returned an error
        if (error) {
            console.error("Resend email error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to send your message right now."
            });
        }

        // Success
        console.log("Contact email sent successfully:", data);

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully.",
            emailId: data?.id || null
        });

    } catch (error) {
        console.error("Contact email error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send your message right now. Please try again later."
        });
    }
});


// HTML security helper
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


module.exports = router;
