const FACTEUR_NIVEAU = { local: 0.06, multi: 0.30, perf: 0.55 };
const TAUX_SECTEUR = { urgence: 0.10, artisan: 0.05, recurrent: 0.04, reflechi: 0.02 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { metier, service1, service2, location_code, location_name, niveau, typeSecteur } = req.body;
  if (!metier || !location_code) return res.status(400).json({ error: 'Métier et localisation requis' });

  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return res.status(500).json({ error: 'Clés API manquantes' });

  const credentials = Buffer.from(`${login}:${password}`).toString('base64');
  const taux_niveau = FACTEUR_NIVEAU[niveau] || FACTEUR_NIVEAU.local;
  const taux_contact = TAUX_SECTEUR[typeSecteur] || TAUX_SECTEUR.artisan;

  // Mots-clés seeds (sans ville — volume géolocalisé depuis la zone)
  const seeds = [...new Set([
    metier,
    service1 && service1,
    service1 && `${metier} ${service1}`,
    service2 && service2,
    service2 && `${metier} ${service2}`,
  ].filter(Boolean))];

  try {
    let allKeywords = [...seeds];

    // ÉTAPE 1 : mots-clés similaires via keywords_for_keywords
    try {
      const step1 = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ keywords: seeds, location_code: Number(location_code), language_code: 'fr' }]),
      });
      const step1Data = await step1.json();
      if (step1Data.status_code === 20000) {
        const terms = seeds.map(t => t.toLowerCase());
        const similar = (step1Data.tasks?.[0]?.result || [])
          .map(i => i.keyword).filter(Boolean)
          .filter(kw => {
            const kwL = kw.toLowerCase();
            return terms.some(t => kwL.startsWith(t) && t.split(' ').every(w => kwL.includes(w)));
          })
          .sort((a, b) => a.length - b.length)
          .slice(0, 10);
        allKeywords = [...new Set([...seeds, ...similar])];
      }
    } catch (e) {
      console.warn('Step1 failed:', e.message);
    }

    // ÉTAPE 2 : volumes exacts depuis la zone géographique réelle
    const r = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ keywords: allKeywords, location_code: Number(location_code), language_code: 'fr' }]),
    });
    const d = await r.json();
    if (d.status_code !== 20000) return res.status(500).json({ error: 'Erreur DataForSEO', detail: d.status_message });

    const items = d.tasks?.[0]?.result || [];
    const keywords = items
      .map(i => ({
        keyword: i.keyword,
        volume_zone: i.search_volume || 0,
        volume_estime: Math.round((i.search_volume || 0) * taux_niveau),
      }))
      .filter(k => k.volume_zone > 0)
      .sort((a, b) => b.volume_zone - a.volume_zone);

    const totalZone = keywords.reduce((s, k) => s + k.volume_zone, 0);
    const totalEstime = Math.round(totalZone * taux_niveau);

    // Estimations par offre
    const offres = [
      { id: 'vl1', label: 'Fiche Google Business',           taux: taux_contact * 1.5 },
      { id: 'vl2', label: 'Site Visibilité locale',          taux: taux_contact },
      { id: 'vl5', label: 'Combo Fiche + Visibilité locale', taux: taux_contact * 2 },
    ];
    if (niveau === 'multi' || niveau === 'perf') {
      offres.push(
        { id: 'vl3', label: 'Site Multi-locale',             taux: taux_contact },
        { id: 'vl6', label: 'Combo Fiche + Multi-locale',    taux: taux_contact * 2 }
      );
    }
    if (niveau === 'perf') {
      offres.push(
        { id: 'vl4', label: 'Site Performance',              taux: taux_contact },
        { id: 'vl7', label: 'Combo Fiche + Performance',     taux: taux_contact * 2 }
      );
    }

    return res.status(200).json({
      metier, service1: service1 || null, service2: service2 || null,
      location_name, niveau,
      taux_niveau_pct: Math.round(taux_niveau * 100),
      taux_contact_pct: Math.round(taux_contact * 100),
      total_keywords: allKeywords.length,
      volume_zone: totalZone,
      volume_estime: totalEstime,
      keywords,
      estimations: offres.map(o => ({
        id: o.id, label: o.label,
        taux_pct: Math.round(o.taux * 100 * 10) / 10,
        clients_mois: Math.round(totalEstime * o.taux * 10) / 10,
      })),
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message, stack: err.stack });
  }
}
