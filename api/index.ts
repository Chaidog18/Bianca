import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const app = express();

// Use /tmp for serverless environments like Vercel
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
const BASE_STORAGE_DIR = isVercel ? '/tmp' : process.cwd();
const UPLOADS_DIR = path.join(BASE_STORAGE_DIR, 'uploads');
const DATA_DIR = path.join(BASE_STORAGE_DIR, 'data');
const SITES_FILE = path.join(DATA_DIR, 'sites.json');

// In-memory fallback cache
const memorySites: Record<string, any> = {};

if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (e) {}
}
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

function readSites(): Record<string, any> {
  try {
    if (fs.existsSync(SITES_FILE)) {
      const raw = fs.readFileSync(SITES_FILE, 'utf-8');
      return { ...memorySites, ...JSON.parse(raw) };
    }
  } catch (err) {}
  return memorySites;
}

function writeSites(sites: Record<string, any>) {
  Object.assign(memorySites, sites);
  try {
    fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2), 'utf-8');
  } catch (err) {}
}

// 1. Upload API
app.post('/api/upload', (req, res) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!dataUrl || !filename) {
      return res.status(400).json({ success: false, error: 'Missing filename or dataUrl' });
    }

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

    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds 15MB limit' });
    }

    let ext = '.gif';
    if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/jpeg') ext = '.jpg';
    else if (mimeType === 'image/webp') ext = '.webp';

    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    try {
      fs.writeFileSync(filePath, buffer);
    } catch (e) {}

    // On serverless Vercel, if disk isn't persistent, return base64 fallback or public endpoint
    const publicUrl = isVercel ? dataUrl : `/api/uploads/${safeName}`;

    return res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      originalName: filename,
      size: buffer.length,
    });
  } catch (error: any) {
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

// 3. Share website config
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
    return res.status(500).json({ success: false, error: error.message || 'Failed to save configuration' });
  }
});

// 4. Retrieve saved website config
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

export default app;
