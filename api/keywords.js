export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { metier, service1, service2, villes } = req.body;
  if (!metier || !villes?.length) return res.status(400).json({ error: 'Métier et au moins une ville requis' });

  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return res.status(500).json({ error: 'Clés API manquantes' });

  const credentials = Buffer.from(`${login}:${password}`).toString('base64');
  const suffixes = ['', ' pas cher', ' urgence', ' devis', ' tarif', ' avis'];
  const allKeywords = [];
  const keywordsByVille = {};

  for (const ville of villes.slice(0, 20)) {
    const v = ville.trim();
    if (!v) continue;
    keywordsByVille[v] = [];

    for (const suffix of suffixes) {
      const push = (kw) => {
        if (!allKeywords.includes(kw)) allKeywords.push(kw);
        if (!keywordsByVille[v].includes(kw)) keywordsByVille[v].push(kw);
      };
      push(`${metier}${suffix} ${v}`);
      if (service1) { push(`${service1}${suffix} ${v}`); push(`${metier} ${service1} ${v}`); }
      if (service2) { push(`${service2}${suffix} ${v}`); push(`${metier} ${service2} ${v}`); }
    }
  }

  const unique = [...new Set(allKeywords)];
  const chunks = [];
  for (let i = 0; i < unique.length; i += 1000) chunks.push(unique.slice(i, i + 1000));

  try {
    let allItems = [];
    for (const chunk of chunks) {
      const r = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ keywords: chunk, location_code: 2250, language_code: 'fr' }]),
      });
      const d = await r.json();
      if (d.status_code !== 20000) return res.status(500).json({ error: 'Erreur DataForSEO', detail: d.status_message });
      allItems = allItems.concat(d.tasks?.[0]?.result || []);
    }

    const volumeMap = {};
    for (const item of allItems) volumeMap[item.keyword] = item.search_volume || 0;

    const villeStats = {};
    for (const [ville, kws] of Object.entries(keywordsByVille)) {
      const totalVille = kws.reduce((s, kw) => s + (volumeMap[kw] || 0), 0);
      villeStats[ville] = {
        ville,
        volume_annuel: totalVille,
        volume_mensuel: Math.round(totalVille / 12),
        keywords: kws.map(kw => ({ keyword: kw, volume: Math.round((volumeMap[kw] || 0) / 12) }))
          .filter(k => k.volume > 0).sort((a, b) => b.volume - a.volume),
      };
    }

    const totalAnnuel = Object.values(villeStats).reduce((s, v) => s + v.volume_annuel, 0);
    const totalMensuel = Math.round(totalAnnuel / 12);

    const conversions = {
      vl1:  { taux: 0.040, label: 'Fiche Google Business' },
      vl2:  { taux: 0.015, label: 'Site Visibilité locale' },
      vl3:  { taux: 0.025, label: 'Site Multi-locale' },
      vl4:  { taux: 0.035, label: 'Site Performance' },
      vl5:  { taux: 0.055, label: 'Combo Fiche + Visibilité locale' },
      vl6:  { taux: 0.065, label: 'Combo Fiche + Multi-locale' },
      vl7:  { taux: 0.075, label: 'Combo Fiche + Performance' },
      sg1:  { taux: 0.080, label: 'Solution Globale Visibilité' },
      sg2:  { taux: 0.100, label: 'Solution Globale Multi-locale' },
      sg3:  { taux: 0.130, label: 'Solution Globale Performance' },
      pub1: { taux: 0.025, label: 'Publicité Starter' },
      pub2: { taux: 0.040, label: 'Publicité Performance' },
      pub3: { taux: 0.060, label: 'Publicité Accélération' },
    };

    const estimations = Object.entries(conversions).map(([id, { taux, label }]) => ({
      id, label,
      taux_pct: Math.round(taux * 100 * 10) / 10,
      clients_mois: Math.round(totalMensuel * taux * 10) / 10,
    }));

    return res.status(200).json({
      metier, service1: service1 || null, service2: service2 || null,
      total_keywords: unique.length,
      total_volume_mensuel: totalMensuel,
      total_volume_annuel: totalAnnuel,
      villes: Object.values(villeStats).sort((a, b) => b.volume_mensuel - a.volume_mensuel),
      estimations,
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
