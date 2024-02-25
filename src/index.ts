import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Create app
const app = express();

// Request information
app.use((req, _, next) => {
  console.log(`Request: ${req.method} ${req.url} ${req.socket.remoteAddress}`);
  next();
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    err ? res.status(400).json({ error: "Bad request." }) : next();
  });
});

app.use(cors());

// Routes
import { userRoutes } from "./routes/user.routes";
app.use("/api/user", userRoutes);

// Route error handler
app.use((_, res) => {
  res.status(404).json({ error: "There is no such API route." });
});

// Connection to db and starting server
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Successfully connected to database. Server is listening on port ${process.env.PORT}.`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
