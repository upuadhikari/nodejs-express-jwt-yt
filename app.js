import express from "express";
import cors from "cors";

// import { Socket } from "socket.io";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import * as http from "http";


//Added by upu

// routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";

// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import compression from "compression";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

//Added by upu end

const app = express();

const httpServer = http.createServer(app);
const router = express.Router();





app.use(compression());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(fileUpload());
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//io
const PORT = process.env.PORT || 5000;

// routes

app.use("/users", authRoutes);

// routes and middleware added by upu5000\
app.use("/api/auth", authRouter);
// Example routes which authenticated  user can only access
  // import authenticateUser from "./middleware/authentication.js";
  // import orderRouter from "./routes/order.js";
        // app.use('/api/order', authenticateUser, orderRouter);
app.use("/api/users", userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// routes and middleware added by upu end

// for impl
const CONNECTION_URL =
  "your url here";
mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    httpServer.listen(PORT, () => {
      console.log("hosted on " + PORT);
    })
  )
  .catch((error) => console.log(`${error} did not connect`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
