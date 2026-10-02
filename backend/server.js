require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection - optional for Contact Form
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB Connected");
        })
        .catch((err) => {
            console.error("MongoDB connection failed:", err.message);
        });
} else {
    console.log(
        "MONGO_URI not set. Contact form can still use email delivery."
    );
}

// Uploads folder
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Contact Form API
app.use(
    "/api/contact",
    require("./routes/contact")
);

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ANAS Technologies backend is running."
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`ANAS Technologies Backend Running On Port ${PORT}`);
});
