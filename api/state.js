// api/state.js
const { createHmac, timingSafeEqual } = require('crypto');

const fromB64u = (s) => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
};

module.exports = async (req, res) => {
  const SECRET   = process.env.STATE_SECRET;
  const SUPA_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SECRET || !SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Missing env vars' });

  const st = typeof req.query.st === 'string' ? req.query.st : '';
  if (!st || !st.includes('.')) return res.status(401).json({ error: 'missing or malformed token' });

  try {
    const [payloadB64, sigB64] = st.split('.', 2);
    const expected = createHmac('sha256', SECRET).update(payloadB64).digest();
    const provided = fromB64u(sigB64);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided))
      return res.status(401).json({ error: 'bad signature' });

    const payload = JSON.parse(fromB64u(payloadB64).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'bad payload' });
    if (typeof payload.exp !== 'number' || now >= payload.exp) return res.status(401).json({ error: 'expired' });

    const snap = payload.state || {};
    const user_id = snap.user_id;
    if (!user_id) return res.status(400).json({ error: 'no user_id in state' });

    const read = await fetch(`${SUPA_URL}/rest/v1/user_state?user_id=eq.${user_id}&select=state`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Accept: 'application/json' },
    });
    if (!read.ok) return res.status(500).json({ error: 'db read failed' });
    const rows = await read.json();

    if (!rows.length) {
      const up = await fetch(`${SUPA_URL}/rest/v1/user_state?on_conflict=user_id`, {
        method: 'POST',
        headers: {
          apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ user_id, state: snap }),
      });
      if (!up.ok) return res.status(500).json({ error: 'db seed failed' });
      return res.status(200).json({ state: snap });
    }

    return res.status(200).json({ state: rows[0].state || snap });
  } catch {
    return res.status(400).json({ error: 'invalid token' });
  }
};
