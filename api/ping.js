export default function handler(req, res) {
  res.status(200).json({ ok: true, pong: true, timestamp: new Date().toISOString() });
}
