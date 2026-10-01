require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

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

app.listen(process.env.PORT, () => {
    console.log(
        `Server Running On Port ${process.env.PORT}`
    );
});