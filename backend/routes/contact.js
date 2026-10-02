const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, email, phone, topic, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const safeTopic = topic || "Not specified";
        const safePhone = phone || "Not provided";

        await transporter.sendMail({
            from: `ANAS Technologies Website <${process.env.EMAIL_USER}>`,
            to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER,
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
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:700px">
                    <h2 style="margin-bottom:20px">New Website Contact Message</h2>
                    <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
                        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(name)}</td></tr>
                        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(email)}</td></tr>
                        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(safePhone)}</td></tr>
                        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Topic</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(safeTopic)}</td></tr>
                    </table>
                    <h3>Message</h3>
                    <div style="padding:15px;background:#f7f7f7;border-left:4px solid #f97316;white-space:pre-wrap">${escapeHtml(message)}</div>
                </div>
            `
        });

        res.status(200).json({
            success: true,
            message: "Your message has been sent successfully."
        });
    } catch (error) {
        console.error("Contact email error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to send your message right now. Please try again later."
        });
    }
});

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = router;
