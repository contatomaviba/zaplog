import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes.js";

// Build the Express app directly inside the Function
const app = express();
app.use(cors());
app.use(express.json());

// Vercel strips the "/api" prefix when invoking the function. Our
// routes are defined with the "/api/..." prefix, so add it back here.
app.use((req, _res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
  }
  next();
});

registerRoutes(app);

export default serverless(app);
