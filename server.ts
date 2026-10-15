import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure persistent folders exist
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DATA_DIR = path.resolve(__dirname, 'data');
const SITES_FILE = path.resolve(DATA_DIR, 'sites.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SITES_FILE)) {
  fs.writeFileSync(SITES_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

// Support large JSON payloads for GIF uploads (up to 30mb)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to read and write sites
function readSites(): Record<string, any> {
  try {
    const raw = fs.readFileSync(SITES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading sites:', err);
    return {};
  }
}

function writeSites(sites: Record<string, any>) {
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2), 'utf-8');
}

// 1. Upload API (accepts base64 or file payload)
app.post('/api/upload', (req, res) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!dataUrl || !filename) {
      return res.status(400).json({ success: false, error: 'Missing filename or dataUrl' });
    }

    // Validate mime
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'Invalid data URL format' });
    }

    const mimeType = matches[1];
    const allowedMimes = ['image/gif', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMimes.includes(mimeType)) {
      return res.status(400).json({ success: false, error: 'Only GIF, PNG, JPG, and WebP images are supported' });
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 15MB size check
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds 15MB limit' });
    }

    // Determine extension
    let ext = '.gif';
    if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/jpeg') ext = '.jpg';
    else if (mimeType === 'image/webp') ext = '.webp';

    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/uploads/${safeName}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      originalName: filename,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Upload failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
});

// 2. Serve uploaded files
app.get('/api/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const ext = path.extname(filename).toLowerCase();
  let contentType = 'image/gif';
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.webp') contentType = 'image/webp';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

// 3. Save / Share website configuration
app.post('/api/share', (req, res) => {
  try {
    const { config, customId } = req.body;
    if (!config) {
      return res.status(400).json({ success: false, error: 'Missing website configuration' });
    }

    const sites = readSites();
    const id = customId && /^[a-zA-Z0-9_-]{4,32}$/.test(customId)
      ? customId
      : `love-${crypto.randomBytes(4).toString('hex')}`;

    sites[id] = {
      id,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    writeSites(sites);

    // Build share URL
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const shareUrl = `${baseUrl}/?love=${id}`;

    return res.json({
      success: true,
      id,
      shareUrl,
      directUrl: `${baseUrl}/love/${id}`,
    });
  } catch (error: any) {
    console.error('Error saving site:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to save configuration' });
  }
});

// 4. Retrieve saved website configuration
app.get('/api/site/:id', (req, res) => {
  const { id } = req.params;
  const sites = readSites();
  const site = sites[id];

  if (!site) {
    return res.status(404).json({ success: false, error: 'Romantic website not found' });
  }

  return res.json({
    success: true,
    site,
  });
});

// 5. Delete shared website (owner option)
app.delete('/api/site/:id', (req, res) => {
  const { id } = req.params;
  const sites = readSites();
  if (sites[id]) {
    delete sites[id];
    writeSites(sites);
    return res.json({ success: true, message: 'Website removed' });
  }
  return res.status(404).json({ success: false, error: 'Site not found' });
});

// Mount Vite or static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Romantic Website Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
