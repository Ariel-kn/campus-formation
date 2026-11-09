export type SeedQuestion = {
  type: "single" | "multiple" | "essay";
  prompt: string;
  options?: string[];
  correctAnswers?: string[];
  maxPoints: number;
};

export type SeedModule = {
  code: string;
  sequence: number;
  title: string;
  summary: string;
  lessons: Array<{ title: string; duration: string; summary: string }>;
  assignment: { title: string; instructions: string; expectedFormat: string };
  assessment: { title: string; instructions: string; questions: SeedQuestion[] };
};

const q = (prompt: string, options: string[], correct: string, maxPoints = 2): SeedQuestion => ({
  type: "single",
  prompt,
  options,
  correctAnswers: [correct],
  maxPoints,
});

const essay = (prompt: string, maxPoints = 10): SeedQuestion => ({
  type: "essay",
  prompt,
  maxPoints,
});

export const curriculum: SeedModule[] = [
  {
    code: "PREC",
    sequence: 1,
    title: "Pré-cours — Fondamentaux du marketing digital",
    summary: "Comprendre les leviers du marketing digital, les canaux numériques et les principaux métiers du secteur.",
    lessons: [
      { title: "Comprendre le marketing digital", duration: "4 h", summary: "Définitions, objectifs, avantages, canaux et piliers." },
      { title: "Les métiers du marketing numérique", duration: "4 h", summary: "Fonctions clés, compétences et profils professionnels." },
    ],
    assignment: {
      title: "Diagnostic d’une présence numérique",
      instructions: "Choisissez une entreprise réelle. Présentez son secteur, ses canaux digitaux utilisés et manquants, ses forces, ses faiblesses et cinq actions prioritaires pour améliorer sa visibilité.",
      expectedFormat: "PDF, Word ou texte. Travail individuel.",
    },
    assessment: {
      title: "Évaluation du pré-cours",
      instructions: "Répondez au QCM puis rédigez une recommandation courte et argumentée.",
      questions: [
        q("Quel est un objectif mesurable du marketing digital ?", ["Accroître la visibilité", "Éviter tout contact client", "Supprimer les données"], "Accroître la visibilité"),
        q("Quel levier améliore la visibilité sur les moteurs de recherche ?", ["SEO", "Packaging", "Radio"], "SEO"),
        q("Quel canal permet une interaction directe avec la communauté ?", ["Les réseaux sociaux", "L’affichage papier", "La presse imprimée"], "Les réseaux sociaux"),
        q("Quel profil analyse les tendances et données de consommation ?", ["Chargé d’études marketing", "Livreur", "Photographe uniquement"], "Chargé d’études marketing"),
        q("Quel métier crée des contenus adaptés à une stratégie de communication ?", ["Concepteur-rédacteur", "Comptable", "Technicien réseau"], "Concepteur-rédacteur"),
        essay("En 150 à 250 mots, expliquez comment une petite entreprise peut combiner au moins trois leviers digitaux pour améliorer sa visibilité.", 10),
      ],
    },
  },
  {
    code: "M1",
    sequence: 2,
    title: "Module 1 — Community Management fondamental",
    summary: "Fondations, posture professionnelle, ligne éditoriale, calendrier de contenu, modération et configuration des plateformes.",
    lessons: [
      { title: "Fondations et écosystème des réseaux sociaux", duration: "3 h", summary: "Rôle des plateformes et choix de marque." },
      { title: "Profil, compétences et synergies du CM", duration: "3 h", summary: "Missions et posture du Community Manager." },
      { title: "Ligne éditoriale stratégique", duration: "3 h", summary: "Piliers, ton et cohérence de marque." },
      { title: "Calendrier éditorial opérationnel", duration: "3 h", summary: "Planification et batching." },
      { title: "Animation, modération et gestion de crise", duration: "3 h", summary: "Réponses, escalade et protection de communauté." },
    ],
    assignment: {
      title: "Livrable portfolio — Stratégie Community Management",
      instructions: "Compilez une fiche d’identité de marque, une charte de collaboration, une charte éditoriale, un calendrier éditorial et un guide de modération/protocole de crise dans un dossier stratégique cohérent.",
      expectedFormat: "Dossier PDF professionnel.",
    },
    assessment: {
      title: "Évaluation de fin de module 1",
      instructions: "QCM puis cas pratique BijouxWax. Répondez de façon structurée et argumentée.",
      questions: [
        q("Quel est le rôle essentiel d’un Community Manager ?", ["Servir de pont relationnel et animer la communauté", "Assurer la livraison physique", "Maintenir seul le site web"], "Servir de pont relationnel et animer la communauté"),
        q("Quelle plateforme est structurellement incontournable en B2B ?", ["LinkedIn", "TikTok", "Instagram"], "LinkedIn"),
        q("Qu’est-ce qu’un Buyer Persona ?", ["Une fiche détaillée du client idéal", "Un module d’IA", "Une analyse technique du concurrent"], "Une fiche détaillée du client idéal"),
        q("Face à un troll persistant, quelle posture adopter ?", ["Réponse neutre puis modération si nécessaire", "Confrontation publique agressive", "Offrir un bon d’achat systématique"], "Réponse neutre puis modération si nécessaire"),
        q("Que signifie la technique du batching ?", ["Regrouper des productions similaires sur un même créneau", "Publier aléatoirement toutes les heures", "Supprimer tous les commentaires négatifs"], "Regrouper des productions similaires sur un même créneau"),
        essay("Cas BijouxWax : expliquez le rôle du Community Manager, proposez deux objectifs, un Buyer Persona et trois piliers de ligne éditoriale avec exemples.", 10),
      ],
    },
  },
  {
    code: "M2",
    sequence: 3,
    title: "Module 2 — Création de contenus professionnels",
    summary: "Stratégie de contenu, storytelling, copywriting, création graphique, vidéo et publication multicanale.",
    lessons: [
      { title: "Stratégie de contenu et storytelling", duration: "3 h", summary: "Angles, audience et narration." },
      { title: "Copywriting et techniques narratives", duration: "3 h", summary: "Accroches, arguments et appels à l’action." },
      { title: "Création graphique avec Canva", duration: "3 h", summary: "Composition visuelle et cohérence de marque." },
      { title: "Montage vidéo et formats Reels/Shorts", duration: "3 h", summary: "Storyboard, montage et formats verticaux." },
      { title: "Publication et automatisation", duration: "3 h", summary: "Adaptation des contenus et programmation." },
    ],
    assignment: {
      title: "Package de contenu complet",
      instructions: "Pour la marque du module 1, réalisez quatre contenus Instagram, deux contenus Facebook, un post LinkedIn, un thread X/Twitter, un concept TikTok et un calendrier de publication sur deux semaines.",
      expectedFormat: "Dossier PDF et fichiers de conception associés.",
    },
    assessment: {
      title: "Évaluation de fin de module 2",
      instructions: "QCM puis cas pratique Cotonou Immo.",
      questions: [
        q("Quelle structure convient à un post Instagram efficace ?", ["Accroche + corps + CTA + hashtags", "Une image avec un emoji", "Un texte de 500 mots sans structure"], "Accroche + corps + CTA + hashtags"),
        q("Quelle technique de storytelling place le client en héros ?", ["Le voyage du héros", "La répétition", "La métaphore seule"], "Le voyage du héros"),
        q("Quel format est prioritaire sur Instagram selon le support de cours ?", ["Les Reels", "Les posts statiques", "Les stories seulement"], "Les Reels"),
        q("Quel outil permet de programmer Facebook et Instagram sans coût de licence ?", ["Meta Business Suite", "Canva", "Un éditeur de texte"], "Meta Business Suite"),
        q("Quel format correspond à une Story Instagram ?", ["1080×1920", "1080×1080", "820×312"], "1080×1920"),
        essay("Cas Cotonou Immo : rédigez le brief d’un carrousel Instagram de cinq slides, le storyboard d’un Reel et un post LinkedIn qui positionne l’agence comme experte.", 10),
      ],
    },
  },
  {
    code: "M3",
    sequence: 4,
    title: "Module 3 — Facebook Ads",
    summary: "Écosystème Meta, campagnes, ciblage, audiences, Pixel et optimisation du retour sur investissement.",
    lessons: [
      { title: "Écosystème Meta et Business Manager", duration: "3 h", summary: "Comptes, actifs et environnements publicitaires." },
      { title: "Création de campagnes performantes", duration: "3 h", summary: "Objectifs et structure de campagne." },
      { title: "Ciblage, audiences et Pixel", duration: "3 h", summary: "Données, audiences et suivi." },
      { title: "Optimisation et ROI", duration: "3 h", summary: "Indicateurs, budget et apprentissage." },
    ],
    assignment: {
      title: "Campagne Meta portfolio",
      instructions: "Concevez une campagne complète avec objectifs, audiences, créatifs, budget, indicateurs et règles d’optimisation.",
      expectedFormat: "Dossier PDF avec captures et justifications.",
    },
    assessment: {
      title: "Évaluation de fin de module 3",
      instructions: "QCM puis cas EduDigital.",
      questions: [
        q("Quelle est la structure à trois niveaux des publicités Meta ?", ["Campagne – Jeu d’annonces – Annonce", "Compte – Campagne – Budget", "Audience – Créatif – Placement"], "Campagne – Jeu d’annonces – Annonce"),
        q("Quel objectif convient à une vente en ligne ?", ["Ventes", "Notoriété", "Engagement"], "Ventes"),
        q("Qu’est-ce qu’une audience Lookalike ?", ["Des profils similaires à une audience existante", "Des personnes ayant toutes déjà acheté", "Des influenceurs du secteur"], "Des profils similaires à une audience existante"),
        q("Quel KPI mesure le retour sur investissement publicitaire ?", ["ROAS", "CPM", "CTR"], "ROAS"),
        q("À quelle fréquence rafraîchir les créatifs selon le cours ?", ["Toutes les deux à trois semaines", "Tous les jours", "Une fois par an"], "Toutes les deux à trois semaines"),
        essay("Cas EduDigital : définissez une stratégie pour recruter 50 étudiants avec 300 000 FCFA, créez deux annonces et donnez les KPIs ainsi qu’un seuil d’arrêt.", 10),
      ],
    },
  },
  {
    code: "M4",
    sequence: 5,
    title: "Module 4 — Instagram Ads",
    summary: "Formats publicitaires, influence marketing, collaborations, Instagram Shopping et optimisation.",
    lessons: [
      { title: "Stratégies et formats Instagram", duration: "3 h", summary: "Objectifs, placements et créations." },
      { title: "Campagnes et influence", duration: "3 h", summary: "Diffusion et sélection de partenaires." },
      { title: "Instagram Shopping et conversion", duration: "3 h", summary: "Parcours produit et conversion." },
    ],
    assignment: {
      title: "Portfolio Instagram",
      instructions: "Créez une stratégie de campagne, une fiche de sélection d’influenceurs, un brief de collaboration et un plan de suivi des KPIs.",
      expectedFormat: "Dossier PDF professionnel.",
    },
    assessment: {
      title: "Évaluation de fin de module 4",
      instructions: "QCM puis cas AfroFit.",
      questions: [
        q("Quel format Instagram présente généralement un fort taux d’engagement ?", ["Carrousel", "Post texte", "Image unique uniquement"], "Carrousel"),
        q("Quelle taille d’influenceur offre souvent le meilleur taux d’engagement ?", ["Micro-influenceur", "Mega-influenceur", "Aucun influenceur"], "Micro-influenceur"),
        q("Quel élément est essentiel dans un brief influenceur ?", ["Objectifs, créatif, modalités et rémunération", "Adresse personnelle", "Contrat de mariage"], "Objectifs, créatif, modalités et rémunération"),
        q("Quel outil permet de taguer des produits sur Instagram ?", ["Instagram Shopping / Commerce Manager", "Google Analytics", "Un tableur uniquement"], "Instagram Shopping / Commerce Manager"),
        q("Quel placement est le plus immersif ?", ["Stories plein écran", "Feed", "Explore"], "Stories plein écran"),
        essay("Cas AfroFit : proposez une répartition de budget, un carrousel de cinq slides, deux Stories Ads et un plan de collaboration avec deux nano-influenceurs fitness.", 10),
      ],
    },
  },
  {
    code: "M5",
    sequence: 6,
    title: "Module 5 — TikTok Ads",
    summary: "Algorithmes, formats sponsorisés, viralité, tendances et analyse des performances TikTok.",
    lessons: [
      { title: "Écosystème TikTok et algorithmes", duration: "3 h", summary: "Signaux d’intérêt et rétention." },
      { title: "Création de campagnes TikTok Ads", duration: "3 h", summary: "Formats et paramétrage." },
      { title: "Contenus sponsorisés et viralité", duration: "3 h", summary: "Tendances et brand safety." },
      { title: "Atelier pratique et analyse", duration: "3 h", summary: "Création, suivi et optimisation." },
    ],
    assignment: {
      title: "Campagne TikTok portfolio",
      instructions: "Construisez une campagne TikTok avec concepts créatifs, scripts, plan Spark Ads et tableau de suivi des performances.",
      expectedFormat: "Dossier PDF avec storyboard.",
    },
    assessment: {
      title: "Évaluation de fin de module 5",
      instructions: "QCM puis cas BurgerBenin.",
      questions: [
        q("Quel facteur pèse fortement dans l’algorithme TikTok ?", ["Le taux de complétion", "Le nombre d’abonnés", "Le nombre de likes seul"], "Le taux de complétion"),
        q("Quel format conserve les interactions organiques ?", ["Spark Ads", "In-Feed Ads", "TopView"], "Spark Ads"),
        q("Quelle durée de vidéo est recommandée dans le cours ?", ["15 à 60 secondes", "3 à 5 minutes", "10 à 15 minutes"], "15 à 60 secondes"),
        q("Que signifie le trend jacking ?", ["Adapter une tendance à sa marque", "Voler le contenu d’un concurrent", "Acheter des abonnés"], "Adapter une tendance à sa marque"),
        q("Quel indicateur reflète une intention d’achat plus forte ?", ["Clics vers le profil ou lien en bio", "Vues", "J’aime"], "Clics vers le profil ou lien en bio"),
        essay("Cas BurgerBenin : proposez trois concepts de vidéos virales, développez le storyboard de la meilleure idée et planifiez une campagne Spark Ads avec 75 000 FCFA.", 10),
      ],
    },
  },
  {
    code: "M6",
    sequence: 7,
    title: "Module 6 — WhatsApp Ads et marketing conversationnel",
    summary: "WhatsApp Marketing, campagnes Click to WhatsApp, automatisation, chatbots et optimisation des conversations.",
    lessons: [
      { title: "Introduction à WhatsApp Marketing", duration: "3 h", summary: "Usages, consentement, relation client et cadre de campagne." },
      { title: "Créer des campagnes Click to WhatsApp", duration: "3 h", summary: "Objectifs, messages d’accueil et qualification de prospects." },
      { title: "Automatisation et chatbots", duration: "3 h", summary: "Scénarios, réponses rapides et parcours conversationnels." },
      { title: "Analyse et optimisation", duration: "3 h", summary: "Suivi des conversations, qualité de réponse et conversion." },
    ],
    assignment: {
      title: "Parcours conversationnel WhatsApp",
      instructions: "Pour une marque locale, construisez une campagne Click to WhatsApp avec audience, message publicitaire, message d’accueil, arbre de qualification et plan de suivi des conversations.",
      expectedFormat: "Dossier PDF incluant un schéma de chatbot ou de réponses rapides.",
    },
    assessment: {
      title: "Évaluation de fin de module 6",
      instructions: "QCM puis étude de cas conversationnelle.",
      questions: [
        q("Quel est l’objectif d’une campagne Click to WhatsApp ?", ["Initier une conversation qualifiée", "Augmenter uniquement les impressions", "Remplacer tous les canaux de vente"], "Initier une conversation qualifiée"),
        q("Quel élément améliore une première réponse WhatsApp ?", ["Un message d’accueil clair", "Une absence de réponse", "Un message vide"], "Un message d’accueil clair"),
        q("Quel usage convient à une réponse rapide ?", ["Répondre aux questions fréquentes", "Publier une vidéo longue", "Modifier un tableur"], "Répondre aux questions fréquentes"),
        q("Quel indicateur est utile pour évaluer une campagne conversationnelle ?", ["Taux de conversations qualifiées", "Couleur du logo", "Nombre de polices utilisées"], "Taux de conversations qualifiées"),
        q("Quelle règle protège la qualité de la relation client ?", ["Obtenir l’accord avant les messages marketing", "Écrire sans consentement", "Répondre après plusieurs semaines"], "Obtenir l’accord avant les messages marketing"),
        essay("Pour une boutique de vêtements, proposez un message publicitaire, un message d’accueil, trois questions de qualification et une règle de relance respectueuse.", 10),
      ],
    },
  },
  {
    code: "M7",
    sequence: 8,
    title: "Module 7 — Google Ads",
    summary: "Introduction à Google Ads, recherche de mots-clés, ciblage, annonces, enchères et optimisation des campagnes.",
    lessons: [
      { title: "Introduction à Google Ads", duration: "3 h", summary: "Écosystème, intentions de recherche et objectifs." },
      { title: "Recherche de mots-clés et ciblage", duration: "3 h", summary: "Requêtes, audiences et sélection de mots-clés." },
      { title: "Création d’annonces et enchères", duration: "3 h", summary: "Annonces efficaces, budget et enchères." },
      { title: "Optimisation et analyse", duration: "3 h", summary: "Qualité, conversions et ajustements." },
    ],
    assignment: {
      title: "Campagne Google Ads portfolio",
      instructions: "Concevez une campagne Search comprenant objectifs, recherche de mots-clés, groupes d’annonces, textes d’annonces, budget et indicateurs de suivi.",
      expectedFormat: "Dossier PDF structuré avec tableau de mots-clés.",
    },
    assessment: {
      title: "Évaluation de fin de module 7",
      instructions: "QCM puis proposition de campagne Search.",
      questions: [
        q("À quel moment une annonce Search peut-elle s’afficher ?", ["Lorsqu’un utilisateur cherche un mot-clé pertinent", "Uniquement quand une vidéo est publiée", "Après l’envoi d’un email"], "Lorsqu’un utilisateur cherche un mot-clé pertinent"),
        q("Quelle étape précède la rédaction d’une annonce Search ?", ["La recherche de mots-clés", "Le montage vidéo", "Le choix d’un filtre photo"], "La recherche de mots-clés"),
        q("Quel indicateur mesure le clic sur une annonce ?", ["CTR", "ROAS uniquement", "Nombre de couleurs"], "CTR"),
        q("Quel élément améliore la pertinence d’une annonce ?", ["Faire correspondre mot-clé, annonce et page de destination", "Employer des termes sans lien", "Ignorer l’intention de recherche"], "Faire correspondre mot-clé, annonce et page de destination"),
        q("Quel est un objectif réaliste d’optimisation ?", ["Améliorer les conversions mesurées", "Créer des clics sans audience", "Supprimer toutes les données"], "Améliorer les conversions mesurées"),
        essay("Pour un centre de formation local, proposez cinq mots-clés, deux annonces Search et trois KPIs pour piloter une campagne Google Ads.", 10),
      ],
    },
  },
  {
    code: "M8",
    sequence: 9,
    title: "Module 8 — SEO et visibilité web",
    summary: "Fondamentaux du référencement, mots-clés, optimisation on-page, technique, netlinking et SEO local.",
    lessons: [
      { title: "Fondamentaux du référencement", duration: "3 h", summary: "Visibilité organique et intention de recherche." },
      { title: "Keywords et optimisation on-page", duration: "3 h", summary: "Pages, titres et contenus." },
      { title: "SEO technique et mobile", duration: "3 h", summary: "Performance, indexation et expérience." },
      { title: "Audit SEO et local SEO", duration: "3 h", summary: "Diagnostic et présence locale." },
    ],
    assignment: {
      title: "Audit SEO portfolio",
      instructions: "Réalisez un audit, une recherche de mots-clés, une liste de recommandations techniques et un plan de visibilité locale pour une marque choisie.",
      expectedFormat: "Dossier PDF avec captures et tableau de recommandations.",
    },
    assessment: {
      title: "Évaluation de fin de module 8",
      instructions: "QCM puis cas Chez Awa.",
      questions: [
        q("Quel pilier SEO est prioritaire dans le support ?", ["Le contenu", "Les backlinks", "La technique uniquement"], "Le contenu"),
        q("Quelle longueur est recommandée pour un title tag ?", ["50 à 60 caractères", "100 à 120 caractères", "200 caractères"], "50 à 60 caractères"),
        q("Quel outil gratuit mesure la vitesse d’un site ?", ["Google PageSpeed Insights", "Ahrefs", "Un logiciel de montage"], "Google PageSpeed Insights"),
        q("Qu’est-ce que Google Business Profile ?", ["La fiche gratuite d’une entreprise sur Google Maps", "Un réseau social professionnel", "Un outil de publicité payante"], "La fiche gratuite d’une entreprise sur Google Maps"),
        q("Quelle métrique Core Web Vitals mesure le chargement perçu ?", ["LCP", "CLS", "INP"], "LCP"),
        essay("Cas Chez Awa : proposez dix mots-clés locaux, cinq recommandations techniques et un plan de configuration Google Business/collecte d’avis.", 10),
      ],
    },
  },
  {
    code: "M9",
    sequence: 10,
    title: "Module 9 — Email marketing",
    summary: "Stratégie, segmentation, personnalisation, automatisation et optimisation de la conversion.",
    lessons: [
      { title: "Stratégie d’email marketing", duration: "3 h", summary: "Objectifs, audience et promesse." },
      { title: "Segmentation et personnalisation", duration: "3 h", summary: "Ciblage et pertinence." },
      { title: "Automation et scénarios", duration: "3 h", summary: "Parcours automatisés et déclencheurs." },
      { title: "Taux d’ouverture et conversion", duration: "3 h", summary: "Objet, contenu et CTA." },
    ],
    assignment: {
      title: "Campagne email portfolio",
      instructions: "Créez une campagne avec segmentation, séquence automatisée, emails, lead magnet et indicateurs de performance.",
      expectedFormat: "Dossier PDF avec maquettes et schéma d’automatisation.",
    },
    assessment: {
      title: "Évaluation de fin de module 9",
      instructions: "QCM puis rédaction d’un mini-scénario de nurturing.",
      questions: [
        q("Quel ROI moyen est associé à l’email marketing dans le support ?", ["36:1", "1:1", "5:1"], "36:1"),
        q("Quel scénario se déclenche après un panier abandonné ?", ["Panier abandonné", "Welcome series", "Newsletter mensuelle"], "Panier abandonné"),
        q("Quel élément influence fortement le taux d’ouverture ?", ["L’objet de l’email", "La couleur du bouton seulement", "La taille de la signature"], "L’objet de l’email"),
        q("Quelle pratique est recommandée pour les CTA ?", ["Un CTA principal visible", "Dix CTA par email", "Cacher le CTA"], "Un CTA principal visible"),
        q("Qu’est-ce qu’un lead magnet ?", ["Un contenu gratuit obtenu contre une adresse email", "Un outil de piratage", "Un logiciel graphique"], "Un contenu gratuit obtenu contre une adresse email"),
        essay("Pour une boutique locale, rédigez le plan d’une séquence d’accueil de trois emails incluant objectif, objet, CTA et logique de personnalisation.", 10),
      ],
    },
  },
  {
    code: "M10",
    sequence: 11,
    title: "Module 10 — Analyse des performances",
    summary: "KPIs, GA4, tableaux de bord, décisions data-driven, veille et rapport stratégique.",
    lessons: [
      { title: "KPIs et indicateurs essentiels", duration: "3 h", summary: "Sélection et calcul des indicateurs." },
      { title: "Google Analytics 4", duration: "3 h", summary: "Événements, conversions et analyse." },
      { title: "Tableaux de bord et rapports", duration: "3 h", summary: "Restitution compréhensible des données." },
      { title: "Data-driven decision making et veille", duration: "3 h", summary: "Décider, apprendre et anticiper." },
    ],
    assignment: {
      title: "Tableau de bord et rapport stratégique",
      instructions: "Pour votre marque portfolio, réalisez un tableau de bord de KPIs, un rapport stratégique de quatre à six pages, cinq recommandations et un plan de veille.",
      expectedFormat: "Dossier PDF et tableau de bord associé.",
    },
    assessment: {
      title: "Évaluation de fin de module 10",
      instructions: "QCM puis analyse des données fournies dans le cas pratique.",
      questions: [
        q("Quelle formule calcule le ROAS ?", ["Chiffre d’affaires / dépenses publicitaires", "Dépenses / conversions", "Clics / impressions"], "Chiffre d’affaires / dépenses publicitaires"),
        q("Quel outil gratuit permet de créer des tableaux de bord ?", ["Google Looker Studio", "Photoshop", "Un tableur sans données"], "Google Looker Studio"),
        q("Que mesure Google Analytics 4 par défaut ?", ["Les événements et conversions", "Les appels uniquement", "Les ventes physiques uniquement"], "Les événements et conversions"),
        q("Quel est le premier objectif d’une veille ?", ["Anticiper les tendances et opportunités", "Copier les concurrents", "Espionner les employés"], "Anticiper les tendances et opportunités"),
        q("Quelle étape suit « Tester » dans la méthode data-driven ?", ["Mesurer", "Observer", "Hypothétiser"], "Mesurer"),
        essay("Cas données : comparez les résultats de septembre, octobre et novembre, identifiez les tendances, calculez les KPIs utiles et proposez cinq actions pour décembre.", 10),
      ],
    },
  },
];

const detailedCaseStudies: Record<string, string> = {
  PREC: "Situation : une petite entreprise locale reste peu visible en ligne malgré une offre utile. Sa dirigeante veut attirer des prospects sans multiplier les dépenses. Après le QCM, analysez ses leviers digitaux prioritaires. Présentez au moins trois canaux complémentaires, leur rôle, un objectif mesurable pour chacun et une logique de suivi. Rédigez votre réponse de manière structurée et argumentée.",
  M1: "Situation — BijouxWax : cette jeune marque de bijoux artisanaux publie de manière irrégulière et reçoit peu d’interactions. Elle souhaite construire une communauté attentive avant sa prochaine collection. Après le QCM, définissez le rôle du Community Manager, deux objectifs SMART, un Buyer Persona détaillé et trois piliers éditoriaux illustrés par des exemples de publications.",
  M2: "Situation — Cotonou Immo : cette agence immobilière souhaite rassurer de jeunes actifs et se distinguer sur Instagram et LinkedIn. Après le QCM, concevez un brief complet de carrousel Instagram en cinq slides, le storyboard d’un Reel et un post LinkedIn mettant en valeur son expertise. Justifiez chaque choix de format, d’angle et d’appel à l’action.",
  M3: "Situation — EduDigital : un établissement de formation doit recruter 50 étudiants avec un budget de 300 000 FCFA en un mois. Après le QCM, proposez une stratégie publicitaire complète : objectif de campagne, audience, répartition budgétaire, deux annonces, indicateurs de pilotage et seuil d’arrêt. Expliquez vos arbitrages.",
  M4: "Situation — AfroFit : une salle de sport veut développer sa notoriété auprès de jeunes actifs et convertir les curieux en essais gratuits. Après le QCM, répartissez le budget, rédigez le concept d’un carrousel de cinq slides, deux Stories Ads et un plan de collaboration avec deux nano-influenceurs. Reliez chaque action à un indicateur de résultat.",
  M5: "Situation — BurgerBenin : une marque de restauration rapide veut relancer ses vidéos courtes auprès d’étudiants et de jeunes salariés. Après le QCM, imaginez trois concepts de vidéos virales, développez le storyboard de la meilleure idée et planifiez une campagne Spark Ads de 75 000 FCFA. Précisez le ciblage, le budget et les KPIs.",
  M6: "Situation : une boutique de vêtements reçoit de nombreux messages mais répond tardivement et perd des prospects. Après le QCM, concevez un parcours conversationnel respectueux : message publicitaire, message d’accueil, trois questions de qualification et règle de relance. Justifiez le ton, le rythme et les limites de la relance.",
  M7: "Situation : un centre de formation local lance un programme professionnel et souhaite apparaître quand des internautes recherchent une formation adaptée. Après le QCM, proposez cinq mots-clés, deux annonces Google Search et trois KPIs de suivi. Expliquez l’intention de recherche ciblée et les optimisations prévues.",
  M8: "Situation — Chez Awa : ce restaurant local dépend fortement du bouche-à-oreille et veut renforcer sa visibilité dans les recherches de proximité. Après le QCM, établissez dix mots-clés locaux, cinq recommandations techniques et un plan de configuration Google Business avec collecte d’avis. Priorisez les actions et justifiez-les.",
  M9: "Situation : une boutique locale collecte des adresses e-mail mais ne transforme pas ces contacts en clients fidèles. Après le QCM, rédigez le plan d’une séquence d’accueil de trois e-mails avec objectif, objet, appel à l’action et logique de personnalisation. Expliquez la progression de la relation.",
  M10: "Situation — Cas données : une marque dispose de résultats mensuels de septembre, octobre et novembre mais ne sait pas quelles décisions prendre pour décembre. Après le QCM, comparez les résultats, identifiez les tendances, calculez les KPIs utiles et proposez cinq actions priorisées pour décembre. Appuyez chaque recommandation sur les données observées.",
};

for (const module of curriculum) module.assessment.instructions = detailedCaseStudies[module.code] ?? module.assessment.instructions;
