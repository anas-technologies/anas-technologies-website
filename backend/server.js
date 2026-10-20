
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// ADMIN LOGIN RATE LIMITER
// ========================================

const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
});

// ========================================
// PUBLIC FORM RATE LIMITER
// ========================================

const publicFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many submissions. Please try again after 15 minutes."
    }
});

// ========================================
// EMAIL NOTIFICATION CONFIGURATION
// ========================================

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// ========================================
// SEND EMAIL NOTIFICATION
// ========================================

async function sendNotification(subject, message) {
    try {
        await mailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.NOTIFICATION_EMAIL,
            subject: subject,
            text: message
        });

        console.log("Email notification sent successfully.");

    } catch (error) {
        console.error("Email Notification Error:", error.message);
    }
}

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const cvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname).toLowerCase();

        cb(null, uniqueName);
    }
});

const cvUpload = multer({
    storage: cvStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".pdf", ".doc", ".docx"];
        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, DOC and DOCX files are allowed."));
        }
    }
});


// ========================================
// MIDDLEWARE
// ========================================

app.use(helmet());
// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
    "http://127.0.0.1:5501",
    "http://localhost:5501"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

// Handle blocked CORS requests safely
app.use((err, req, res, next) => {
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed."
        });
    }

    next(err);
});

app.use(express.json({ limit: "10kb" }));

// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {
    res.send("ANAS Technologies Backend is Running!");
});

// ========================================
// API HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ANAS Technologies API is working"
    });
});

// ========================================
// CONTACT FORM API
// ========================================

app.post("/api/contact", publicFormLimiter, async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body || {};

        // Check required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required."
            });
        }

        // Validate email address
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Validate optional fields
        if (
            (phone != null && typeof phone !== "string") ||
            (service != null && typeof service !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone or service."
            });
        }

        // Validate field lengths
        if (
            name.trim().length > 100 ||
            email.trim().length > 254 ||
            message.trim().length > 5000 ||
            (phone && phone.trim().length > 30) ||
            (service && service.trim().length > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more fields exceed the allowed length."
            });
        }

        // ========================================
        // SAVE CONTACT MESSAGE TO POSTGRESQL
        // ========================================

        const query = `
            INSERT INTO contact_messages
            (name, email, phone, service, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;

        const values = [
            name.trim(),
            email.trim(),
            phone?.trim() || null,
            service?.trim() || null,
            message.trim()
        ];

        const result = await pool.query(query, values);

        console.log(
            "Contact message saved with ID:",
            result.rows[0].id
        );

        // Send notification for new contact message
void sendNotification(
    "New Contact Message - ANAS Technologies",
    `New contact form submission:

Name: ${name.trim()}
Email: ${email.trim()}
Phone: ${phone?.trim() || "Not provided"}
Service: ${service?.trim() || "Not provided"}

Message:
${message.trim()}`
);

        // Success response
        return res.status(201).json({
            success: true,
            message: "Your message has been received successfully!"
        });

    } catch (error) {
        console.error("Contact API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save your message. Please try again."
        });
    }
});




 // ========================================
 // GET A QUOTE API
 // ========================================

app.post("/api/quote", publicFormLimiter, async (req, res) => {
    try {
        const {
            services,
            budget,
            timeline,
            details,
            fullname,
            email,
            phone,
            company
        } = req.body || {};

        // Validate required fields
        if (
            !Array.isArray(services) ||
            services.length === 0 ||
            !services.every(s => typeof s === "string") ||
            typeof budget !== "string" ||
            !budget.trim() ||
            typeof timeline !== "string" ||
            !timeline.trim() ||
            typeof details !== "string" ||
            !details.trim() ||
            typeof fullname !== "string" ||
            !fullname.trim() ||
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required fields."
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (
            (phone != null && typeof phone !== "string") ||
            (company != null && typeof company !== "string") ||
            services.length > 6 ||
            services.some(s => s.length > 50) ||
            budget.length > 50 ||
            timeline.length > 50 ||
            details.length > 5000 ||
            fullname.length > 100 ||
            email.length > 254 ||
            (phone && phone.length > 30) ||
            (company && company.length > 150)
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more fields are invalid or too long."
            });
        }

        // Save quotation request to PostgreSQL
        const query = `
            INSERT INTO quote_requests
            (services, budget, timeline, details,
             fullname, email, phone, company)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;

        const values = [
            services,
            budget.trim(),
            timeline.trim(),
            details.trim(),
            fullname.trim(),
            email.trim(),
            phone?.trim() || null,
            company?.trim() || null
        ];

        const result = await pool.query(query, values);

        console.log(
            "Quote request saved with ID:",
            result.rows[0].id
        );

        // Send notification for new quote request
void sendNotification(
    "New Quote Request - ANAS Technologies",
    `New quotation request received:

Name: ${fullname.trim()}
Email: ${email.trim()}
Phone: ${phone?.trim() || "Not provided"}
Company: ${company?.trim() || "Not provided"}

Services: ${services.join(", ")}
Budget: ${budget.trim()}
Timeline: ${timeline.trim()}

Project Details:
${details.trim()}`
);

        return res.status(201).json({
            success: true,
            message: "Your quote request has been submitted successfully!"
        });

    } catch (error) {
        console.error("Quote API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save your quote request. Please try again."
        });
    }
});


 // ========================================
 // CAREERS APPLICATION API
 // ========================================

app.post("/api/careers", publicFormLimiter, (req, res) => {
    cvUpload.single("cv")(req, res, async (uploadError) => {

        if (uploadError) {
            return res.status(400).json({
                success: false,
                message: uploadError.code === "LIMIT_FILE_SIZE"
                    ? "CV must be 5 MB or smaller."
                    : uploadError.message
            });
        }

        const removeUploadedCV = async () => {
            if (req.file) {
                await fs.promises.unlink(req.file.path).catch(() => {});
            }
        };

        try {
            const {
                fullname,
                email,
                phone,
                position,
                cover_letter
            } = req.body || {};

            const allowedPositions = [
                "uiux",
                "frontend",
                "backend"
            ];

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                typeof fullname !== "string" ||
                typeof email !== "string" ||
                typeof phone !== "string" ||
                typeof position !== "string" ||
                !fullname.trim() ||
                !emailPattern.test(email.trim()) ||
                !phone.trim() ||
                !allowedPositions.includes(position) ||
                (cover_letter != null && typeof cover_letter !== "string") ||
                fullname.length > 100 ||
                email.length > 254 ||
                phone.length > 30 ||
                (cover_letter && cover_letter.length > 5000) ||
                !req.file
            ) {
                await removeUploadedCV();

                return res.status(400).json({
                    success: false,
                    message: "Please provide valid application details and a CV."
                });
            }

            // Check the uploaded file's actual format
            const handle = await fs.promises.open(req.file.path, "r");
            let signature;

            try {
                const buffer = Buffer.alloc(8);
                const { bytesRead } = await handle.read(buffer, 0, 8, 0);
                signature = buffer.subarray(0, bytesRead);
            } finally {
                await handle.close();
            }

            const extension = path.extname(req.file.originalname).toLowerCase();

            const isPdf =
                extension === ".pdf" &&
                signature.subarray(0, 5).toString() === "%PDF-";

            const isDoc =
                extension === ".doc" &&
                signature.toString("hex") === "d0cf11e0a1b11ae1";

            const isDocx =
                extension === ".docx" &&
                signature.subarray(0, 4).toString("hex") === "504b0304";

            if (!isPdf && !isDoc && !isDocx) {
                await removeUploadedCV();

                return res.status(400).json({
                    success: false,
                    message: "The uploaded CV is not a valid PDF, DOC or DOCX file."
                });
            }

            const query = `
                INSERT INTO job_applications
                (fullname, email, phone, position,
                 cv_filename, cv_original_name, cover_letter)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;

            const values = [
                fullname.trim(),
                email.trim(),
                phone.trim(),
                position,
                req.file.filename,
                req.file.originalname,
                cover_letter?.trim() || null
            ];

            const result = await pool.query(query, values);

            console.log(
                "Career application saved with ID:",
                result.rows[0].id
            );

            // Send notification for new job application
        
    
void sendNotification(
    "New Job Application - ANAS Technologies",
    `New job application received:

Name: ${fullname.trim()}
Email: ${email.trim()}
Phone: ${phone.trim()}
Position: ${position}

Cover Letter:
${cover_letter?.trim() || "Not provided"}

CV File: ${req.file.originalname}

Log in to the admin dashboard to download the CV.`
);

            return res.status(201).json({
                success: true,
                message: "Your job application has been submitted successfully!"
            });

        } catch (error) {
            await removeUploadedCV();

            console.error("Careers API Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to submit your application. Please try again."
            });
        }
    });
});


 // ========================================
 // ADMIN LOGIN API
 // ========================================

app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
    try {
        const { password } = req.body || {};

        if (typeof password !== "string" || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your admin password."
            });
        }

        const passwordHash = process.env.ADMIN_PASSWORD_HASH;
        const jwtSecret = process.env.JWT_SECRET;

        if (!passwordHash || !jwtSecret) {
            console.error("Admin authentication is not configured.");

            return res.status(500).json({
                success: false,
                message: "Admin login is temporarily unavailable."
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            passwordHash
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin password."
            });
        }

        const token = jwt.sign(
            { role: "admin" },
            jwtSecret,
            { expiresIn: "1h", algorithm: "HS256" }
        );

        return res.json({
            success: true,
            message: "Admin login successful!",
            token
        });

    } catch (error) {
        console.error("Admin Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log in. Please try again."
        });
    }
});


 // ========================================
 // ADMIN AUTHENTICATION MIDDLEWARE
 // ========================================

function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Admin login required."
        });
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        req.admin = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired login session."
        });
    }
}


 // ========================================
 // ADMIN - VIEW CONTACT MESSAGES
 // ========================================

app.get("/api/admin/contacts", verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, phone, service, message, created_at
            FROM contact_messages
            ORDER BY created_at DESC, id DESC
        `);

        return res.json({
            success: true,
            contacts: result.rows
        });

    } catch (error) {
        console.error("Admin Contacts API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load contact messages."
        });
    }
});


 // ========================================
 // ADMIN - VIEW QUOTE REQUESTS
 // ========================================

app.get("/api/admin/quotes", verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, services, budget, timeline, details,
                   fullname, email, phone, company, created_at
            FROM quote_requests
            ORDER BY created_at DESC, id DESC
        `);

        return res.json({
            success: true,
            quotes: result.rows
        });

    } catch (error) {
        console.error("Admin Quotes API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load quote requests."
        });
    }
});


 // ========================================
 // ADMIN - VIEW JOB APPLICATIONS
 // ========================================

app.get("/api/admin/careers", verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, fullname, email, phone, position,
                   cv_original_name, cover_letter, created_at
            FROM job_applications
            ORDER BY created_at DESC, id DESC
        `);

        return res.json({
            success: true,
            applications: result.rows
        });

    } catch (error) {
        console.error("Admin Careers API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load job applications."
        });
    }
});


 // ========================================
 // ADMIN - DOWNLOAD APPLICANT CV
 // ========================================

app.get("/api/admin/careers/:id/cv", verifyAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID."
            });
        }

        const result = await pool.query(
            `SELECT cv_filename, cv_original_name
             FROM job_applications
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        const application = result.rows[0];
        const filename = application.cv_filename;

        // Only allow files stored directly inside uploads
        if (path.basename(filename) !== filename) {
            return res.status(400).json({
                success: false,
                message: "Invalid CV filename."
            });
        }

        const filePath = path.join(uploadFolder, filename);

        return res.download(
            filePath,
            application.cv_original_name,
            (error) => {
                if (error && !res.headersSent) {
                    console.error("CV Download Error:", error);

                    res.status(404).json({
                        success: false,
                        message: "CV file not found."
                    });
                }
            }
        );

    } catch (error) {
        console.error("Admin CV API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to download CV."
        });
    }
});

// ========================================
// ADMIN - VIEW NEWSLETTER SUBSCRIBERS
// ========================================

app.get("/api/admin/newsletter", verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, email, subscribed_at
            FROM newsletter_subscribers
            ORDER BY subscribed_at DESC, id DESC
        `);

        return res.json({
            success: true,
            subscribers: result.rows
        });

    } catch (error) {
        console.error("Admin Newsletter API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load newsletter subscribers."
        });
    }
});

// ========================================
// NEWSLETTER SUBSCRIPTION API
// ========================================

app.post("/api/newsletter", publicFormLimiter, async (req, res) => {
    try {
        const { email } = req.body || {};

        if (typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            cleanEmail.length === 0 ||
            cleanEmail.length > 254 ||
            !emailPattern.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const result = await pool.query(
            `INSERT INTO newsletter_subscribers (email)
             VALUES ($1)
             ON CONFLICT (email) DO NOTHING
             RETURNING id`,
            [cleanEmail]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({
                success: false,
                message: "This email is already subscribed."
            });
        }

        
        // Show new subscriber in backend terminal
        console.log(
            "New Newsletter Subscriber:",
            cleanEmail
        );

        // Send email notification to website owner
        void sendNotification(
            "New Newsletter Subscriber - ANAS Technologies",
            `A new user has subscribed to the newsletter.

Subscriber Email: ${cleanEmail}

You can view this subscriber in the Admin Dashboard.`
        );


        return res.status(201).json({
            success: true,
            message: "You have subscribed successfully!"
        });

    } catch (error) {
        console.error("Newsletter API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to subscribe. Please try again."
        });
    }
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
