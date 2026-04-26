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

  // Seeds par ville
  const seedsByVille = {};
  for (const ville of villes.slice(0, 20)) {
    const v = ville.trim();
    if (!v) continue;
    const seeds = [`${metier} ${v}`];
    if (service1) seeds.push(`${service1} ${v}`, `${metier} ${service1} ${v}`);
    if (service2) seeds.push(`${service2} ${v}`, `${metier} ${service2} ${v}`);
    seedsByVille[v] = seeds;
  }

  const allSeeds = [...new Set(Object.values(seedsByVille).flat())];
  const terms = [metier, service1, service2].filter(Boolean).map(t => t.toLowerCase().trim());

  try {
    let filteredSimilar = [];

    // ÉTAPE 1 : mots-clés similaires (optionnel — on continue si ça échoue)
    try {
      const step1 = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ keywords: allSeeds, location_code: 2250, language_code: 'fr' }]),
      });
      const step1Data = await step1.json();
      if (step1Data.status_code === 20000) {
        const similarRaw = (step1Data.tasks?.[0]?.result || []).map(i => i.keyword).filter(Boolean);
        filteredSimilar = similarRaw
          .filter(kw => {
            const kwL = kw.toLowerCase();
            if (!terms.some(t => kwL.startsWith(t))) return false;
            return terms.some(t => t.split(' ').every(w => kwL.includes(w)));
          })
          .sort((a, b) => a.length - b.length)
          .slice(0, 10);
      }
    } catch (e) {
      console.warn('Step1 failed:', e.message);
    }

    // ÉTAPE 2 : volumes exacts
    const allKeywordsToCheck = [...new Set([...allSeeds, ...filteredSimilar])];
    const chunks = [];
    for (let i = 0; i < allKeywordsToCheck.length; i += 1000) chunks.push(allKeywordsToCheck.slice(i, i + 1000));

    let allItems = [];
    for (const chunk of chunks) {
      const r = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ keywords: chunk, location_code: 2250, language_code: 'fr' }]),
      });
      const d = await r.json();
      if (d.status_code !== 20000) return res.status(500).json({ error: 'Erreur DataForSEO step2', detail: d.status_message });
      allItems = allItems.concat(d.tasks?.[0]?.result || []);
    }

    const volumeMap = {};
    for (const item of allItems) volumeMap[item.keyword] = item.search_volume || 0;

    // Volumes par ville
    const villeStats = {};
    for (const [ville, seeds] of Object.entries(seedsByVille)) {
      const kwsForVille = allKeywordsToCheck.filter(kw => kw.toLowerCase().includes(ville.toLowerCase()));
      const totalVille = kwsForVille.reduce((s, kw) => s + (volumeMap[kw] || 0), 0);
      villeStats[ville] = {
        ville,
        volume_annuel: totalVille,
        volume_mensuel: Math.round(totalVille / 12),
        keywords: kwsForVille
          .map(kw => ({ keyword: kw, volume: Math.round((volumeMap[kw] || 0) / 12) }))
          .filter(k => k.volume > 0)
          .sort((a, b) => b.volume - a.volume),
      };
    }

    const villesTriees = Object.values(villeStats).sort((a, b) => b.volume_mensuel - a.volume_mensuel);
    const vol1  = villesTriees.slice(0, 1).reduce((s, v) => s + v.volume_mensuel, 0);
    const vol10 = villesTriees.slice(0, 10).reduce((s, v) => s + v.volume_mensuel, 0);
    const vol20 = villesTriees.slice(0, 20).reduce((s, v) => s + v.volume_mensuel, 0);
    const totalAnnuel = villesTriees.reduce((s, v) => s + v.volume_annuel, 0);
    const totalMensuel = Math.round(totalAnnuel / 12);

    const conversions = {
      vl1: { taux: 0.060, label: 'Fiche Google Business',             vol: vol1  },
      vl2: { taux: 0.020, label: 'Site Visibilité locale',            vol: vol1  },
      vl3: { taux: 0.020, label: 'Site Multi-locale (10 villes)',      vol: vol10 },
      vl4: { taux: 0.020, label: 'Site Performance (20 villes)',       vol: vol20 },
      vl5: { taux: 0.070, label: 'Combo Fiche + Visibilité locale',    vol: vol1  },
      vl6: { taux: 0.070, label: 'Combo Fiche + Multi-locale (10 v.)', vol: vol10 },
      vl7: { taux: 0.070, label: 'Combo Fiche + Performance (20 v.)',  vol: vol20 },
    };

    const estimations = Object.entries(conversions).map(([id, { taux, label, vol }]) => ({
      id, label,
      taux_pct: Math.round(taux * 100 * 10) / 10,
      clients_mois: Math.round(vol * taux * 10) / 10,
    }));

    return res.status(200).json({
      metier, service1: service1 || null, service2: service2 || null,
      total_keywords: allKeywordsToCheck.length,
      total_volume_mensuel: totalMensuel,
      total_volume_annuel: totalAnnuel,
      vol_1ville: vol1, vol_10villes: vol10, vol_20villes: vol20,
      villes: villesTriees,
      estimations,
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message, stack: err.stack });
  }
}
