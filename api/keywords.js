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

  // Mots-clés de base (seeds) pour chaque ville
  const seedsByVille = {};
  for (const ville of villes.slice(0, 20)) {
    const v = ville.trim();
    if (!v) continue;
    const seeds = [`${metier} ${v}`];
    if (service1) seeds.push(`${service1} ${v}`);
    if (service2) seeds.push(`${service2} ${v}`);
    seedsByVille[v] = seeds;
  }

  const allSeeds = [...new Set(Object.values(seedsByVille).flat())];

  try {
    // ── ÉTAPE 1 : Récupérer les mots-clés similaires ──
    const step1 = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        keywords: allSeeds,
        location_code: 2250,
        language_code: 'fr',
      }]),
    });
    const step1Data = await step1.json();
    if (step1Data.status_code !== 20000) {
      return res.status(500).json({ error: 'Erreur DataForSEO step1', detail: step1Data.status_message });
    }

    // Récupère tous les mots-clés similaires trouvés
    const similarItems = step1Data.tasks?.[0]?.result || [];
    const similarKeywords = similarItems.map(i => i.keyword).filter(Boolean);

    // Combine seeds + similaires, dédupliqués
    const allKeywordsToCheck = [...new Set([...allSeeds, ...similarKeywords])];

    // ── ÉTAPE 2 : Volumes exacts sur tous les mots-clés ──
    const chunks = [];
    for (let i = 0; i < allKeywordsToCheck.length; i += 1000) {
      chunks.push(allKeywordsToCheck.slice(i, i + 1000));
    }

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

    // Map keyword → volume
    const volumeMap = {};
    for (const item of allItems) volumeMap[item.keyword] = item.search_volume || 0;

    // Attribue chaque mot-clé similaire à la ville la plus pertinente
    // Un mot-clé est associé à une ville s'il contient le nom de ville
    const keywordsByVille = {};
    for (const ville of Object.keys(seedsByVille)) {
      keywordsByVille[ville] = [];
    }

    for (const kw of allKeywordsToCheck) {
      const kwLower = kw.toLowerCase();
      // Cherche quelle ville ce mot-clé concerne
      let matched = false;
      for (const ville of Object.keys(seedsByVille)) {
        if (kwLower.includes(ville.toLowerCase())) {
          keywordsByVille[ville].push(kw);
          matched = true;
          break;
        }
      }
      // Si pas de ville trouvée dans le mot-clé, on l'ignore
    }

    // Calcul des volumes par ville
    const villeStats = {};
    for (const [ville, kws] of Object.entries(keywordsByVille)) {
      const unique = [...new Set(kws)];
      const totalVille = unique.reduce((s, kw) => s + (volumeMap[kw] || 0), 0);
      villeStats[ville] = {
        ville,
        volume_annuel: totalVille,
        volume_mensuel: Math.round(totalVille / 12),
        keywords: unique
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
      vl1:  { taux: 0.040, label: 'Fiche Google Business',              vol: vol1  },
      vl2:  { taux: 0.015, label: 'Site Visibilité locale',             vol: vol1  },
      vl3:  { taux: 0.025, label: 'Site Multi-locale (10 villes)',       vol: vol10 },
      vl4:  { taux: 0.035, label: 'Site Performance (20 villes)',        vol: vol20 },
      vl5:  { taux: 0.055, label: 'Combo Fiche + Visibilité locale',     vol: vol1  },
      vl6:  { taux: 0.065, label: 'Combo Fiche + Multi-locale (10 v.)',  vol: vol10 },
      vl7:  { taux: 0.075, label: 'Combo Fiche + Performance (20 v.)',   vol: vol20 },
    };

    const estimations = Object.entries(conversions).map(([id, { taux, label, vol }]) => ({
      id, label,
      taux_pct: Math.round(taux * 100 * 10) / 10,
      clients_mois: Math.round(vol * taux * 10) / 10,
    }));

    return res.status(200).json({
      metier, service1: service1 || null, service2: service2 || null,
      total_keywords: allKeywordsToCheck.length,
      total_similar: similarKeywords.length,
      total_volume_mensuel: totalMensuel,
      total_volume_annuel: totalAnnuel,
      vol_1ville: vol1,
      vol_10villes: vol10,
      vol_20villes: vol20,
      villes: villesTriees,
      estimations,
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
