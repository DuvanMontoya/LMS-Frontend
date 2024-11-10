import { handler } from './build/handler.js';
import express from 'express';

const app = express();
const port = 3001; // Cambiado a 3001

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3001, () => {
  console.log(`listening on port ${port}`);
});