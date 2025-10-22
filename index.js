// Import required packages for the server
import express from "express";          // Web framework for Node.js
import dotenv from "dotenv";            // Loads environment variables from .env file
import cors from "cors";
import cookieParser from "cookie-parser"; // Parses cookies from client requests
import mongoose from "mongoose";        // MongoDB object modeling library
import authRoutes from './routes/AuthRoutes.js'
// Load environment variables from .env file
import contactsRoutes from "./routes/ContactRoutes.js"
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
dotenv.config();

const app = express();

const port = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

// Basic CORS (single origin from .env)
app.use(
  cors({
    origin: process.env.ORIGIN,
     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Static, cookies, JSON
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files",express.static("uploads/files"))
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channels", channelRoutes);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

// Sockets
setupSocket(server);

// DB connect
mongoose
  .connect(databaseUrl)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log("error connecting to db", err.message);
  });