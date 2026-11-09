export type CourseTable = { title: string; headers: string[]; rows: string[][] };

const gmsM1: CourseTable[][] = [
  [
    { title: "Panorama des plateformes et spécificités algorithmiques", headers: ["Plateforme", "Audience", "Format privilégié", "Algorithme"], rows: [
      ["Facebook", "Généraliste, 25-55 ans", "Vidéos, groupes, stories", "Interactions de proximité : commentaires longs et partages privés"],
      ["Instagram", "Jeune, 18-35 ans", "Reels, Stories, Carrousels", "Taux de rétention et enregistrements"],
      ["LinkedIn", "Professionnels, B2B", "Articles, carrousels éducatifs", "Contenus à forte valeur ajoutée"],
      ["TikTok", "Jeune, 16-30 ans", "Vidéos courtes verticales", "Taux de complétion, indépendamment du nombre d’abonnés"],
      ["X (Twitter)", "Actualité, 20-45 ans", "Micro-blogging, threads", "Immédiateté et interactions rapides"],
      ["WhatsApp Business", "Local, proximité", "Catalogues, messages directs", "Marketing conversationnel et automatisation"],
      ["YouTube", "Tous âges", "Vidéos longues et Shorts", "Durée de visionnage et engagement"],
      ["Telegram", "Communautés engagées", "Canaux, groupes, bots", "Diffusion massive sans algorithme filtrant"],
    ] },
    { title: "Les cinq missions du Community Manager", headers: ["Mission", "Description", "Livrable"], rows: [
      ["Stratégie", "Définir à qui l’on s’adresse, comment on s’exprime et sur quels sujets", "Ligne éditoriale, Buyer Persona"],
      ["Création", "Concevoir les textes et choisir les formats visuels ou vidéo adaptés", "Contenus graphiques, vidéos, copy"],
      ["Planification", "Organiser la diffusion des messages dans le temps", "Calendrier éditorial"],
      ["Animation", "Dialoguer avec l’audience, répondre aux questions, modérer", "Rituel communautaire, SAV"],
      ["Analyse", "Mesurer les résultats pour vérifier les objectifs", "Rapport KPI, tableau de bord"],
    ] },
  ],
  [
    { title: "Compétences clés du Community Manager", headers: ["Hard Skills (techniques)", "Soft Skills (comportementales)"], rows: [
      ["Rédaction impeccable ; maîtrise des outils graphiques ; culture numérique ; analyse de données et KPIs ; gestion de projet", "Empathie et écoute active ; réactivité et gestion du stress ; curiosité et adaptabilité ; diplomatie et patience ; créativité et initiative"],
    ] },
    { title: "Erreurs à éviter", headers: ["Erreur", "Conséquence", "Solution"], rows: [
      ["Manque de relecture", "Décrédibilisation immédiate de la marque", "Checklist de validation obligatoire"],
      ["Confusion des comptes", "Publication personnelle sur compte professionnel", "Déconnexion systématique et outils de gestion"],
      ["Réaction émotionnelle", "Crise d’image publique", "Protocole de réponse et recul de 10 minutes"],
      ["Manque de régularité", "Baisse de visibilité algorithmique", "Calendrier éditorial et batching"],
      ["Pilotage à vue", "Contenu sans objectif, mauvais ROI", "Ligne éditoriale structurée avec KPIs"],
    ] },
  ],
  [
    { title: "Méthodologie du Buyer Persona", headers: ["Catégorie", "Informations à collecter", "Exemple"], rows: [
      ["Démographiques", "Âge, genre, profession, revenu, localisation", "Marc, 28 ans, cadre, Cotonou"],
      ["Psychographiques", "Centres d’intérêt, valeurs, style de vie", "Aime la cuisine rapide, le fitness, les réseaux"],
      ["Besoins et frustrations", "Problèmes quotidiens, attentes non satisfaites", "Manque de temps, livraison lente des concurrents"],
      ["Habitudes numériques", "Réseaux utilisés, horaires, formats préférés", "Instagram 12h-14h et 18h-21h, aime les Reels"],
    ] },
    { title: "Les trois piliers de contenu", headers: ["Pilier", "Objectif", "Exemples", "Proportion"], rows: [
      ["Éducatif", "Apporter de la valeur, installer l’expertise", "Tutoriels, astuces, infographies, décryptages", "40 %"],
      ["Inspirant", "Humaniser, créer une connexion émotionnelle", "Coulisses, équipe, histoire, engagements RSE", "30 %"],
      ["Promotionnel", "Générer conversions et ventes", "Offres, lancements, témoignages clients", "30 %"],
    ] },
  ],
  [
    { title: "Anatomie d’un calendrier éditorial", headers: ["Colonne", "Description"], rows: [
      ["Date & Heure", "Date exacte et heure stratégique de publication"], ["Statut", "À rédiger / en attente de visuel / en validation / planifié"], ["Réseau social", "Instagram, Facebook, LinkedIn, TikTok…"], ["Pilier", "Éducatif, inspirant ou promotionnel"], ["Format", "Reel, carrousel, photo, Story, texte"], ["Copywriting", "Accroche, corps et appel à l’action"], ["Brief visuel", "Consignes pour le graphiste ou lien média"], ["Hashtags", "Sélection ciblée de tags"],
    ] },
    { title: "Fréquence et rythme de publication", headers: ["Plateforme", "Fréquence idéale", "Meilleurs horaires"], rows: [
      ["Facebook", "3-4 fois/semaine + Stories quotidiennes", "7h30-8h30, 12h30-13h30, 18h-20h"], ["Instagram", "4-5 fois/semaine + 1-3 Stories/jour", "12h-13h, 18h-20h"], ["LinkedIn", "2-3 fois/semaine", "8h-9h, 12h-13h, 17h-18h"], ["TikTok", "1 par jour minimum au lancement", "7h-9h, 12h-13h, 19h-21h"],
    ] },
  ],
  [
    { title: "Matrice de modération", headers: ["Type de profil", "Caractéristiques", "Posture opérationnelle"], rows: [
      ["Client déçu", "Insatisfaction réelle liée au produit ou service", "Écoute, excuse publique, bascule en message privé"], ["Troll", "Polémique stérile, provocation, insulte", "Réponse neutre une fois ; masquer ou bloquer si persiste"], ["Spammeur", "Commentaires publicitaires, liens suspects", "Suppression immédiate, bannissement si récidive"],
    ] },
  ],
];

const businessDigitalTables: Record<string, CourseTable[][]> = {
  BD1: [[], [], [{ title: "Parcours client et points de contact", headers: ["Étape", "Rôle"], rows: [["Awareness", "Faire découvrir la marque"], ["Consideration", "Nourrir l’intérêt et faciliter la comparaison"], ["Conversion", "Guider vers l’action attendue"], ["Loyalty", "Fidéliser et encourager la recommandation"]] }]],
  BD4: [[{ title: "Métriques financières clés", headers: ["Indicateur", "Lecture attendue"], rows: [["CA", "Chiffre d’affaires"], ["ROI", "Retour sur investissement global"], ["ROAS", "Retour spécifique aux dépenses publicitaires"], ["CAC", "Dépenses marketing divisées par les nouveaux clients"], ["LTV", "Valeur vie client ; le ratio LTV/CAC doit dépasser 3"]] }], [], []],
  BD6: [[], [{ title: "Référentiel des KPIs Business Digital", headers: ["KPI", "Définition"], rows: [["Taux d’engagement", "(Likes + Commentaires + Partages) / Impressions × 100"], ["Portée organique", "Comptes uniques atteints sans budget publicitaire"], ["Taux d’interaction", "Clics sur le lien / impressions de publication"], ["NPS", "Promoteurs moins détracteurs ; voir module 5"], ["Croissance abonnés", "Nouveaux abonnés / abonnés totaux × 100 sur 30 jours"]] }], []],
};

const rawTableBlockSignatures: Record<string, string[][]> = {
  M1: [
    ["Plateforme Audience Format privilégié Algorithme", "Mission Description Livrable"],
    ["Hard Skills (Techniques)", "Erreur Conséquence Solution"],
    ["Catégorie Informations à collecter Exemple", "Pilier Objectif Exemples Proportion"],
    ["Colonne Description", "Plateforme Fréquence idéale Meilleurs horaires"],
    ["Type de profil Caractéristiques Posture opérationnelle"],
  ],
  BD1: [[], [], ["Étape", "Awareness", "Consideration", "Conversion", "Loyalty"]],
  BD4: [["Indicateur", "CA", "ROI", "ROAS", "CAC", "LTV"], [], []],
  BD6: [[], ["KPI", "Taux d’engagement", "Portée organique", "Taux d’interaction", "NPS"], []],
};

const rawTableRanges: Record<string, Array<Array<{ start: string; end: string }>>> = {
  M1: [
    [{ start: "Plateforme           Audience", end: "1.3 Les 5 Missions du CM" }, { start: "Mission           Description", end: "1.4 Cadre Légal et Éthique" }],
    [{ start: "Hard Skills (Techniques)", end: "2.2 L'Écosystème Collaboratif" }, { start: "Erreur                       Conséquence", end: "CAS PRATIQUE" }],
    [{ start: "Catégorie                    Informations à collecter", end: "3.2 Le Tone of Voice" }, { start: "Pilier                  Objectif", end: "CAS PRATIQUE" }],
    [{ start: "Colonne                     Description", end: "4.2 Fréquence et Rythme de Publication" }, { start: "Plateforme        Fréquence idéale", end: "4.3 La Méthode du Batching" }],
    [{ start: "Type de", end: "Règle d'or" }],
  ],
};

export function getCourseTables(moduleCode: string, lessonSequence: number): CourseTable[] {
  if (moduleCode === "M1") return gmsM1[lessonSequence - 1] ?? [];
  return businessDigitalTables[moduleCode]?.[lessonSequence - 1] ?? [];
}

export function isRawCourseTableBlock(moduleCode: string, lessonSequence: number, block: string): boolean {
  const signatures = rawTableBlockSignatures[moduleCode]?.[lessonSequence - 1] ?? [];
  if (!signatures.length) return false;
  const normalized = block.replace(/\s+/g, " ").trim().toLocaleLowerCase("fr-FR");
  return signatures.some(signature => normalized.includes(signature.toLocaleLowerCase("fr-FR")));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
}

export function stripRawCourseTables(moduleCode: string, lessonSequence: number, text: string): string {
  const ranges = rawTableRanges[moduleCode]?.[lessonSequence - 1] ?? [];
  return ranges.reduce((result, range) => result.replace(new RegExp(`${escapeRegExp(range.start)}[\\s\\S]*?(?=${escapeRegExp(range.end)})`, "gi"), ""), text);
}
