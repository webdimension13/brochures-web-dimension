// Codes DataForSEO pour les départements français
const DEPARTEMENTS = {
  "01": { name: "Ain", code: 1000426 },
  "02": { name: "Aisne", code: 1000427 },
  "03": { name: "Allier", code: 1000428 },
  "04": { name: "Alpes-de-Haute-Provence", code: 1000429 },
  "05": { name: "Hautes-Alpes", code: 1000430 },
  "06": { name: "Alpes-Maritimes", code: 1000431 },
  "07": { name: "Ardèche", code: 1000432 },
  "08": { name: "Ardennes", code: 1000433 },
  "09": { name: "Ariège", code: 1000434 },
  "10": { name: "Aube", code: 1000435 },
  "11": { name: "Aude", code: 1000436 },
  "12": { name: "Aveyron", code: 1000437 },
  "13": { name: "Bouches-du-Rhône", code: 1000438 },
  "14": { name: "Calvados", code: 1000439 },
  "15": { name: "Cantal", code: 1000440 },
  "16": { name: "Charente", code: 1000441 },
  "17": { name: "Charente-Maritime", code: 1000442 },
  "18": { name: "Cher", code: 1000443 },
  "19": { name: "Corrèze", code: 1000444 },
  "21": { name: "Côte-d'Or", code: 1000446 },
  "22": { name: "Côtes-d'Armor", code: 1000447 },
  "23": { name: "Creuse", code: 1000448 },
  "24": { name: "Dordogne", code: 1000449 },
  "25": { name: "Doubs", code: 1000450 },
  "26": { name: "Drôme", code: 1000451 },
  "27": { name: "Eure", code: 1000452 },
  "28": { name: "Eure-et-Loir", code: 1000453 },
  "29": { name: "Finistère", code: 1000454 },
  "30": { name: "Gard", code: 1000455 },
  "31": { name: "Haute-Garonne", code: 1000456 },
  "32": { name: "Gers", code: 1000457 },
  "33": { name: "Gironde", code: 1000458 },
  "34": { name: "Hérault", code: 1000459 },
  "35": { name: "Ille-et-Vilaine", code: 1000460 },
  "36": { name: "Indre", code: 1000461 },
  "37": { name: "Indre-et-Loire", code: 1000462 },
  "38": { name: "Isère", code: 1000463 },
  "39": { name: "Jura", code: 1000464 },
  "40": { name: "Landes", code: 1000465 },
  "41": { name: "Loir-et-Cher", code: 1000466 },
  "42": { name: "Loire", code: 1000467 },
  "43": { name: "Haute-Loire", code: 1000468 },
  "44": { name: "Loire-Atlantique", code: 1000469 },
  "45": { name: "Loiret", code: 1000470 },
  "46": { name: "Lot", code: 1000471 },
  "47": { name: "Lot-et-Garonne", code: 1000472 },
  "48": { name: "Lozère", code: 1000473 },
  "49": { name: "Maine-et-Loire", code: 1000474 },
  "50": { name: "Manche", code: 1000475 },
  "51": { name: "Marne", code: 1000476 },
  "52": { name: "Haute-Marne", code: 1000477 },
  "53": { name: "Mayenne", code: 1000478 },
  "54": { name: "Meurthe-et-Moselle", code: 1000479 },
  "55": { name: "Meuse", code: 1000480 },
  "56": { name: "Morbihan", code: 1000481 },
  "57": { name: "Moselle", code: 1000482 },
  "58": { name: "Nièvre", code: 1000483 },
  "59": { name: "Nord", code: 1000484 },
  "60": { name: "Oise", code: 1000485 },
  "61": { name: "Orne", code: 1000486 },
  "62": { name: "Pas-de-Calais", code: 1000487 },
  "63": { name: "Puy-de-Dôme", code: 1000488 },
  "64": { name: "Pyrénées-Atlantiques", code: 1000489 },
  "65": { name: "Hautes-Pyrénées", code: 1000490 },
  "66": { name: "Pyrénées-Orientales", code: 1000491 },
  "67": { name: "Bas-Rhin", code: 1000492 },
  "68": { name: "Haut-Rhin", code: 1000493 },
  "69": { name: "Rhône", code: 1000494 },
  "70": { name: "Haute-Saône", code: 1000495 },
  "71": { name: "Saône-et-Loire", code: 1000496 },
  "72": { name: "Sarthe", code: 1000497 },
  "73": { name: "Savoie", code: 1000498 },
  "74": { name: "Haute-Savoie", code: 1000499 },
  "75": { name: "Paris", code: 1000500 },
  "76": { name: "Seine-Maritime", code: 1000501 },
  "77": { name: "Seine-et-Marne", code: 1000502 },
  "78": { name: "Yvelines", code: 1000503 },
  "79": { name: "Deux-Sèvres", code: 1000504 },
  "80": { name: "Somme", code: 1000505 },
  "81": { name: "Tarn", code: 1000506 },
  "82": { name: "Tarn-et-Garonne", code: 1000507 },
  "83": { name: "Var", code: 1000508 },
  "84": { name: "Vaucluse", code: 1000509 },
  "85": { name: "Vendée", code: 1000510 },
  "86": { name: "Vienne", code: 1000511 },
  "87": { name: "Haute-Vienne", code: 1000512 },
  "88": { name: "Vosges", code: 1000513 },
  "89": { name: "Yonne", code: 1000514 },
  "90": { name: "Territoire de Belfort", code: 1000515 },
  "91": { name: "Essonne", code: 1000516 },
  "92": { name: "Hauts-de-Seine", code: 1000517 },
  "93": { name: "Seine-Saint-Denis", code: 1000518 },
  "94": { name: "Val-de-Marne", code: 1000519 },
  "95": { name: "Val-d'Oise", code: 1000520 },
  "971": { name: "Guadeloupe", code: 1000521 },
  "972": { name: "Martinique", code: 1000522 },
  "973": { name: "Guyane", code: 1000523 },
  "974": { name: "La Réunion", code: 1000524 },
};

// Part du volume départemental capturée selon le niveau
const TAUX_NIVEAU = {
  local: 0.06,   // 1 ville ≈ 6% du département
  multi: 0.30,   // 10 villes ≈ 30% du département
  perf:  0.55,   // 20 villes ≈ 55% du département
};

// Taux de contact par secteur
const TAUX_SECTEUR = {
  urgence:   0.10,
  artisan:   0.05,
  recurrent: 0.04,
  reflechi:  0.02,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { metier, service1, service2, departement, niveau, typeSecteur } = req.body;
  if (!metier || !departement) return res.status(400).json({ error: 'Métier et département requis' });

  const dep = DEPARTEMENTS[departement];
  if (!dep) return res.status(400).json({ error: 'Département invalide' });

  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return res.status(500).json({ error: 'Clés API manquantes' });

  const credentials = Buffer.from(`${login}:${password}`).toString('base64');

  // Mots-clés sans ville — volume depuis le département
  const seeds = [metier];
  if (service1) seeds.push(service1, `${metier} ${service1}`);
  if (service2) seeds.push(service2, `${metier} ${service2}`);

  const taux_niveau = TAUX_NIVEAU[niveau] || TAUX_NIVEAU.local;
  const taux_contact = TAUX_SECTEUR[typeSecteur] || TAUX_SECTEUR.artisan;

  try {
    // Étape 1 : mots-clés similaires (optionnel)
    let allKeywords = [...new Set(seeds)];
    try {
      const step1 = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ keywords: seeds, location_code: dep.code, language_code: 'fr' }]),
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

    // Étape 2 : volumes depuis le département
    const r = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ keywords: allKeywords, location_code: dep.code, language_code: 'fr' }]),
    });
    const d = await r.json();
    if (d.status_code !== 20000) return res.status(500).json({ error: 'Erreur DataForSEO', detail: d.status_message });

    const items = d.tasks?.[0]?.result || [];
    const keywords = items
      .map(i => ({ keyword: i.keyword, volume_dep: i.search_volume || 0, volume_zone: Math.round((i.search_volume || 0) * taux_niveau) }))
      .filter(k => k.volume_dep > 0)
      .sort((a, b) => b.volume_dep - a.volume_dep);

    const totalDep = keywords.reduce((s, k) => s + k.volume_dep, 0);
    const totalZone = Math.round(totalDep * taux_niveau);

    // Estimations par offre
    const estimations = [
      { id: 'vl1', label: 'Fiche Google Business',              taux: taux_contact * 1.5 },
      { id: 'vl2', label: 'Site Visibilité locale',             taux: taux_contact },
      { id: 'vl5', label: 'Combo Fiche + Visibilité locale',    taux: taux_contact * 2 },
    ];
    if (niveau === 'multi' || niveau === 'perf') {
      estimations.push(
        { id: 'vl3', label: 'Site Multi-locale', taux: taux_contact },
        { id: 'vl6', label: 'Combo Fiche + Multi-locale', taux: taux_contact * 2 }
      );
    }
    if (niveau === 'perf') {
      estimations.push(
        { id: 'vl4', label: 'Site Performance', taux: taux_contact },
        { id: 'vl7', label: 'Combo Fiche + Performance', taux: taux_contact * 2 }
      );
    }

    return res.status(200).json({
      metier, service1: service1 || null, service2: service2 || null,
      departement: dep.name,
      niveau,
      taux_niveau_pct: Math.round(taux_niveau * 100),
      taux_contact_pct: Math.round(taux_contact * 100),
      total_keywords: allKeywords.length,
      volume_departement: totalDep,
      volume_zone: totalZone,
      keywords,
      estimations: estimations.map(e => ({
        id: e.id, label: e.label,
        taux_pct: Math.round(e.taux * 100 * 10) / 10,
        clients_mois: Math.round(totalZone * e.taux * 10) / 10,
      })),
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message, stack: err.stack });
  }
}
