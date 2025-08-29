import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes.js";

// Build the Express app directly inside the Function
const app = express();
app.use(cors());
app.use(express.json());
registerRoutes(app);

export default serverless(app);
