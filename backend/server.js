require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB Connected");
        })
        .catch((err) => {
            console.error("MongoDB connection failed:", err.message);
        });
} else {
    console.log("MONGO_URI not set. Contact form can still use email delivery.");
}

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

app.use(
    "/api/jobs",
    require("./routes/jobs")
);

app.use(
    "/api/applications",
    require("./routes/applications")
);

app.use(
    "/api/contact",
    require("./routes/contact")
);

app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "ANAS Technologies backend is running." });
});

app.listen(process.env.PORT, () => {
    console.log(
        `Server Running On Port ${process.env.PORT}`
    );
});
