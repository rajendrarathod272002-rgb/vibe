const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Serve assets from local assets directory or fallback /assets
const localAssets = path.join(__dirname, 'assets');
if (fs.existsSync(localAssets)) {
  app.use('/assets', express.static(localAssets));
}
if (fs.existsSync('/assets')) {
  app.use('/assets', express.static('/assets'));
}

// Serve static assets from project root
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'VYBE Apparel' });
});

// Clean URL routing fallback (e.g. /shop -> /shop.html)
app.get('*', (req, res) => {
  const reqPath = req.path;
  if (reqPath.endsWith('.html') || reqPath.includes('.')) {
    return res.status(404).send('Not Found');
  }
  const cleanPath = reqPath.replace(/^\//, '').replace(/\/$/, '');
  const candidateHtml = path.join(__dirname, cleanPath + '.html');
  res.sendFile(candidateHtml, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
