import serverless from "serverless-http";
import app from "../dist/server/index.js";
export default serverless(app);
