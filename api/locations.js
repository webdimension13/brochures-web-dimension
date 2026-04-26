// Endpoint pour récupérer les locations françaises disponibles dans DataForSEO
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return res.status(500).json({ error: 'Clés API manquantes' });

  const credentials = Buffer.from(`${login}:${password}`).toString('base64');

  try {
    const r = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/locations/fr', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    const d = await r.json();
    if (d.status_code !== 20000) return res.status(500).json({ error: d.status_message });

    // Filtre uniquement les régions/départements (pas les villes individuelles)
    const locations = (d.tasks?.[0]?.result || [])
      .filter(l => ['Region', 'Province', 'Department', 'County'].includes(l.location_type))
      .map(l => ({
        code: l.location_code,
        name: l.location_name.replace(',France', '').replace(', France', '').trim(),
        type: l.location_type,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ locations, total: locations.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
