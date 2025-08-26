import app from '../dist/server/index.js';
export default function handler(req, res) {
	app(req, res);
}
