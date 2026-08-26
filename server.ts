import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();

await connectDB();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Server is Live!");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});