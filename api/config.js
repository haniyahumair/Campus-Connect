export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ GOOGLEMAP_API_KEY: process.env.GOOGLEMAP_API_KEY || '' });
}
