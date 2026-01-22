// require("dotenv").config({path : "./.env"}); 
import dotenv from "dotenv";
import express from "express";
import connectDB from "./DataB/index.js";

dotenv.config({ path: "./.env" });

connectDB()

// const app = express();
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 