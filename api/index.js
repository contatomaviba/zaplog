import app from '../dist/server/index.js';
import serverless from 'serverless-http';
export default serverless(app);
