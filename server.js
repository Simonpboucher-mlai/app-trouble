// server.js
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);
  
  // API routes
  app.post('/api/chat', async (req, res) => {
    try {
      // Import the API handler
      const apiModule = await import('./api/chat.js');
      const handler = apiModule.default;
      
      // Call the handler with the request and response
      await handler(req, res);
    } catch (error) {
      console.error('Error handling API request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Serve static files
  app.use(express.static(resolve(__dirname, 'dist')));
  
  // Fallback to index.html
  app.use('*', async (req, res) => {
    let template = fs.readFileSync(
      resolve(__dirname, 'index.html'),
      'utf-8'
    );
    
    template = await vite.transformIndexHtml(req.originalUrl, template);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  });
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer().catch(console.error); 