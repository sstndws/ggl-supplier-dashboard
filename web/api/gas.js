const GAS_URL =
  process.env.GAS_URL ||
  'https://script.google.com/macros/s/AKfycbySQt20CiIRiSMYI4IpYWiJmtdI52B44_5gFyc_86gPoSnnu3Y5d2_rx4-3PjFJq4Vsxg/exec';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body;
    if (req.method === 'GET') {
      body = JSON.stringify({ route: req.query.route || '/api/initial', ...req.query });
    } else {
      body =
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body || { route: '/api/initial' });
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
    });

    const text = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy gagal';
    return res.status(502).json({ error: message });
  }
}
