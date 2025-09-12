// api/state.js
const { createHmac, timingSafeEqual, createHash } = require('crypto');

const fromB64u = (s) => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
};

function verifyInitData(initData, botToken) {
  // Telegram WebApp initData verify (docs)
  const url = new URLSearchParams(initData);
  const hash = url.get('hash');
  if (!hash) return { ok: false, err: 'no hash' };

  url.delete('hash');
  // sort by key and build data_check_string
  const pairs = [];
  for (const [k, v] of url.entries()) pairs.push(`${k}=${v}`);
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secret = createHash('sha256').update(botToken).digest();
  const hmac = createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (hmac !== hash) return { ok: false, err: 'bad hash' };

  const authDate = Number(url.get('auth_date') || '0');
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > 3600) return { ok: false, err: 'expired' }; // 1h okno

  let user = {};
  try { user = JSON.parse(url.get('user') || '{}'); } catch {}
  return { ok: true, user };
}

module.exports = async (req, res) => {
  const SECRET    = process.env.STATE_SECRET;
  const SUPA_URL  = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const SUPA_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!SECRET || !SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Missing env vars' });

  // --- tryb A: st token w URL ---
  const st = typeof req.query.st === 'string' ? req.query.st : '';

  // --- tryb B: init_data z Telegrama (POST JSON { init_data }) albo GET ?init=... ---
  let initData = '';
  if (!st) {
    if (req.method === 'POST') {
      try { const body = await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(d)); });
            const json = JSON.parse(body || '{}'); initData = json.init_data || ''; } catch {}
    } else {
      initData = typeof req.query.init === 'string' ? req.query.init : '';
    }
  }

  let user_id = null;
  let snapshot = null;

  // A) weryfikacja st
  if (st) {
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

      snapshot = payload.state || {};
      user_id = snapshot.user_id;
    } catch {
      return res.status(400).json({ error: 'invalid token' });
    }
  }
  // B) weryfikacja init_data
  else if (initData) {
    if (!BOT_TOKEN) return res.status(500).json({ error: 'Missing BOT_TOKEN' });
    const ver = verifyInitData(initData, BOT_TOKEN);
    if (!ver.ok) return res.status(401).json({ error: `init_data ${ver.err}` });
    user_id = ver.user && (ver.user.id || ver.user.user_id);
    if (!user_id) return res.status(400).json({ error: 'no user_id in init_data' });
    snapshot = { user_id, regionsUnlocked: [], key_shards: {}, universal_key_shards: 0 };
  } else {
    return res.status(401).json({ error: 'missing or malformed token' });
  }

  // --- Supabase read/seed ---
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
      body: JSON.stringify({ user_id, state: snapshot }),
    });
    if (!up.ok) return res.status(500).json({ error: 'db seed failed' });
    return res.status(200).json({ state: snapshot });
  }

  return res.status(200).json({ state: rows[0].state || snapshot });
};
