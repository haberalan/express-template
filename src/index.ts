import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Create app
const app = express();

// Get request information
app.use((req: Request, _, next: NextFunction) => {
  console.log(
    `Request: ${req.method} - ${req.path} - ${req.socket.remoteAddress}`
  );
  next();
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req: Request, res: Response, next: NextFunction) => {
  bodyParser.json()(req, res, (err) => {
    err ? res.status(400).json({ error: "Bad request." }) : next();
  });
});
app.use(cors());

// Routes
import { userRoutes } from "./routes/user.routes";
app.use("/api/user", userRoutes);

// Route error handler
app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log(err, req);
    res.status(500).json({ error: "Internal server error." });
  }
);

// Connection to db and starting up server
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
