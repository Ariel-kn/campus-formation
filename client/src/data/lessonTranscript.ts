export type LessonTranscript = {
  introduction: string;
  objectives: string[];
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
  table?: { headers: string[]; rows: string[][] };
};

type ModuleTranscript = Omit<LessonTranscript, "introduction"> & { introductions: string[] };

const source: Record<string, ModuleTranscript> = {
  PREC: {
    introductions: ["Imaginez deux commerçants. Le premier imprime 5 000 affiches, les distribue dans toute la ville et attend les clients. Le second publie une publicité Facebook ciblant uniquement les femmes de 25 à 45 ans vivant à Cotonou, intéressées par les cosmétiques naturels. Il dépense seulement 10 000 FCFA et obtient 80 commandes. Le second a utilisé ses ressources de manière plus efficace parce qu'il a utilisé le marketing digital.", "Le marketing digital n'est pas un métier unique, mais un écosystème de professions complémentaires. Derrière chaque publication sur les réseaux sociaux, chaque publicité sur Facebook ou TikTok, chaque site bien positionné sur Google, il y a une équipe de spécialistes avec des rôles précis."],
    objectives: ["Définir précisément le marketing digital", "Expliquer son importance pour les entreprises", "Différencier le marketing traditionnel et le marketing digital", "Identifier les principaux canaux numériques", "Comprendre le parcours d'un client sur Internet", "Reconnaître les métiers du marketing digital", "Élaborer une stratégie digitale simple"],
    sections: [
      { heading: "Comprendre le marketing digital", paragraphs: ["Le marketing digital est l'ensemble des techniques, stratégies et outils utilisés sur les supports numériques afin de promouvoir une entreprise, une marque, un produit ou un service, attirer des prospects, les convertir en clients et les fidéliser.", "Il ne s'agit pas seulement de publier des photos sur Facebook. C'est une discipline qui combine la communication, la psychologie du consommateur, l'analyse des données, la publicité, la création de contenu et les technologies numériques.", "Une entreprise ne fait pas du marketing digital « pour être présente sur Facebook ». Elle poursuit des objectifs mesurables : accroître la visibilité, générer des prospects, transformer les prospects en clients et fidéliser les clients. Un prospect est une personne susceptible de devenir cliente. Le marketing digital attire ces personnes qualifiées. Le marketing digital accompagne les prospects jusqu'à l'achat grâce à des contenus et des offres adaptées. Un client satisfait peut acheter plusieurs fois et recommander l'entreprise. La fidélisation coûte généralement moins cher que l'acquisition.", "Les habitudes de consommation ont profondément changé. Avant d'acheter un téléphone, de choisir un restaurant ou de réserver un hôtel, beaucoup de personnes consultent des avis en ligne, comparent les prix et regardent des vidéos. Les canaux d'aujourd'hui sont notamment Google, Facebook, Instagram, TikTok, WhatsApp, YouTube et LinkedIn.", "Le ciblage précis permet de choisir les personnes qui verront une publicité selon leur âge, leur localisation, leurs centres d’intérêt ou leurs comportements. Avec quelques milliers de francs CFA, une petite entreprise peut toucher des milliers de personnes. Les résultats sont mesurables : personnes ayant vu une publicité, clics, coût par clic et ventes générées. Les réseaux sociaux permettent un dialogue direct avec les consommateurs ; cette proximité favorise la confiance et la fidélité."], bullets: ["Le référencement naturel (SEO) pour être visible sur Google", "La publicité en ligne (SEA) pour toucher rapidement une audience ciblée", "Le marketing sur les réseaux sociaux pour créer une communauté et développer la notoriété", "Le marketing de contenu pour attirer les clients grâce à des informations utiles", "L'email marketing pour fidéliser et relancer les prospects", "L'analyse des données pour mesurer les résultats et améliorer les actions"] },
      { heading: "Les métiers du marketing numérique", paragraphs: ["Comprendre ces métiers permet de répondre à trois questions fondamentales : Quel métier correspond à mon profil ? Quelles compétences dois-je développer en priorité ? Comment évolue une carrière dans le digital ? Le marketing digital repose sur cinq fonctions clés : création de contenu (textes, vidéos, visuels), diffusion et communication (réseaux sociaux, publicité), analyse de données (performance, ROI, trafic), optimisation de visibilité (SEO, référencement) et relation client (engagement, fidélisation).", "Responsable marketing numérique : définit la stratégie pour promouvoir l'image d'une marque et trouver de nouveaux clients. Coordonne une équipe, met en place un plan d'actions et assure le suivi des plannings et des budgets. Ce métier demande de l'organisation, des capacités d'analyse et une bonne résistance au stress.", "Chargé d'études marketing : analyse les données de consommation et les tendances du marché afin de proposer des stratégies adaptées. Il contribue à fidéliser les clients existants et à en trouver de nouveaux. Ce métier demande de la rigueur, une aisance avec les chiffres, un bon sens de l'observation et de l'inventivité.", "Chef ou cheffe de projet marketing : connaît les attentes et les besoins des consommateurs, coordonne les équipes et accompagne le lancement de nouveaux produits. Il ou elle conçoit et réalise des campagnes de promotion en ligne. Ce métier demande de savoir communiquer, de proposer des idées et de négocier.", "Concepteur ou conceptrice rédactrice : crée des contenus adaptés à la stratégie marketing d'un client pour une diffusion sur les sites internet et les réseaux sociaux. Travaille avec des photographes et des graphistes, s'adapte aux plannings et trouve l'idée qui touchera la cible. Ce métier demande de la créativité, de l'adaptation et une bonne qualité rédactionnelle.", "Manageur ou manageuse de traffic : améliore la visibilité d'une entreprise en utilisant le site internet, les réseaux sociaux, les campagnes publicitaires en ligne et les envois de mails ciblés. Suit les indicateurs, gère les budgets, adapte les campagnes aux marchés et reste en veille sur les technologies. Ce métier demande de maîtriser les budgets et l'analyse des statistiques.", "Témoignages à deviner : Mounia, 40 ans, travaille depuis 8 ans pour une grande banque marocaine. Elle définit la stratégie, gère une équipe de 5 personnes, les plans d’actions, plannings et budgets du marketing numérique. Messan, 25 ans, analyse les données de consommation d’une entreprise de télécommunications en République centrafricaine et propose des stratégies de fidélisation adaptées aux profils des cibles.", "Tahina, 32 ans, travaille pour une chaîne de restauration rapide à Madagascar ; elle connaît les besoins des consommateurs, construit l’équipe qui conçoit les menus et conçoit les campagnes de promotion en ligne lors d’un lancement. Justine, 22 ans, travaille à son compte pour des institutions publiques, associations et ministères ; elle crée des contenus pour des sites internet et réseaux sociaux avec des photographes et graphistes. Fouzia, 28 ans, travaille pour une entreprise de tourisme en Tunisie ; elle améliore la visibilité en ligne, suit les vues et les citations de l’entreprise, adapte les campagnes aux pays et analyse les statistiques.", "Exemples concrets : une grande banque s’appuie sur une responsable marketing numérique pour définir sa stratégie et coordonner ses actions. Une entreprise de télécommunications mobilise un chargé d’études marketing pour analyser les données et proposer des stratégies de fidélisation. Une chaîne de restauration rapide fait appel à une cheffe de projet marketing pour concevoir et réaliser une campagne de promotion en ligne. Des institutions publiques collaborent avec une conceptrice rédactrice pour produire des contenus adaptés. Une entreprise de tourisme confie à une manageuse de traffic la visibilité en ligne, le suivi des indicateurs et l’adaptation des campagnes aux marchés visés.", "Travaux pratiques : Cas pratique 1 — Une entreprise lance un nouveau produit et a besoin de visibilité rapide sur les réseaux sociaux, d’engagement communautaire et de ventes immédiates. Travail demandé : identifier les métiers nécessaires et expliquer le rôle de chacun. Cas pratique 2 — Une entreprise veut améliorer sa visibilité en ligne et adapter ses actions aux profils de ses cibles. Travail demandé : choisir parmi les cinq profils présentés ceux qui interviendraient et décrire leurs trois premières actions.", "Exercice à la maison à remettre en PDF : rédiger un document de 20 lignes minimum et de 30 lignes maximum. Expliquer quel métier vous choisissez et pourquoi, en vous basant sur votre connaissance de chacun des métiers et sur vos capacités et compétences personnelles. Nommer clairement le métier choisi, expliquer ses missions principales, présenter les capacités correspondantes, expliquer les compétences à améliorer et justifier ce choix avec des arguments personnels. Consigne importante : n’utilisez pas l’intelligence artificielle pour rédiger cet exercice.", "À retenir : le marketing digital repose sur une organisation structurée de métiers spécialisés. Chaque rôle contribue à un objectif commun : attirer, engager et convertir les clients. Comprendre ces métiers permet de mieux se former, mieux choisir sa carrière et mieux travailler en équipe."], bullets: ["Identifier les principaux métiers du marketing digital", "Comprendre les missions quotidiennes de chaque rôle", "Distinguer les compétences techniques et humaines requises", "Choisir une orientation professionnelle cohérente", "Comprendre les évolutions de carrière possibles"] },
    ],
    table: { headers: ["Critère", "Marketing traditionnel", "Marketing digital"], rows: [["Support", "TV, radio, affiches, presse", "Internet, réseaux sociaux, moteurs de recherche"], ["Coût", "Souvent élevé", "Flexible et accessible"], ["Ciblage", "Large", "Très précis"], ["Mesure des résultats", "Limitée", "Très détaillée"], ["Interaction", "Faible", "Immédiate"], ["Ajustement des campagnes", "Lent", "Rapide"]] },
  },
  M1: {
    introductions: ["Le Community Manager transforme les objectifs d’une marque en interactions régulières et utiles.", "Le rôle du Community Manager associe ligne éditoriale, planification, animation et modération.", "Une ligne éditoriale donne une direction cohérente aux contenus.", "Le calendrier transforme la stratégie en actions organisées.", "La modération protège la qualité de la relation et la réputation de la marque."],
    objectives: ["Définir une cible", "Structurer une ligne éditoriale", "Planifier et modérer avec cohérence"],
    sections: [
      { heading: "Fondations du Community Management", paragraphs: ["Le Community Manager fait le lien entre la marque et sa communauté. Son action repose sur une cible claire, des objectifs, des contenus pertinents et une capacité à écouter les retours."], bullets: ["Cible", "Objectif", "Ton de voix", "Règles de réponse"] },
      { heading: "Ligne et calendrier éditoriaux", paragraphs: ["La ligne éditoriale précise les piliers de contenu, le ton et les formats. Le calendrier associe à chaque publication un objectif, un format, une date, un responsable et un appel à l’action."], bullets: ["Planifier par lots", "Prévoir une veille", "Contrôler la cohérence de marque"] },
      { heading: "Animation et modération", paragraphs: ["Une question, un avis, une plainte, une désinformation ou une provocation ne se traitent pas de la même manière. La réponse doit être empathique, documentée et escaladée lorsque la situation est sensible."], bullets: ["Répondre", "Documenter", "Escalader", "Protéger la communauté"] },
    ],
  },
  M2: {
    introductions: ["La stratégie de contenu part toujours de la cible, de l’angle et de la valeur proposée.", "Le copywriting rend une idée claire, persuasive et actionnable.", "La création graphique sert la lisibilité et la cohérence d’une marque.", "La vidéo courte exige un rythme, un hook et un storyboard.", "La publication multicanale adapte le même message au contexte de chaque réseau."],
    objectives: ["Choisir un angle de contenu", "Construire une accroche et un CTA", "Produire des formats adaptés au mobile"],
    sections: [
      { heading: "Stratégie et storytelling", paragraphs: ["Chaque publication associe une cible, un angle, une promesse et une action attendue. Le storytelling rend le client ou le bénéficiaire central dans le récit de marque."], bullets: ["Cible", "Angle", "Promesse", "Action attendue"] },
      { heading: "Copywriting", paragraphs: ["Une publication efficace commence par une accroche, apporte une preuve ou une valeur concrète, puis se termine par un appel à l’action unique. Le texte est adapté au format et à la plateforme."], bullets: ["Accroche", "Valeur", "Preuve", "CTA"] },
      { heading: "Production et diffusion", paragraphs: ["Un carrousel suit un fil logique. Un Reel commence par un hook. Une vidéo est préparée avec un storyboard, des sous-titres et une vérification de lisibilité mobile avant programmation."], bullets: ["Charte graphique", "Storyboard", "Sous-titres", "Programmation"] },
    ],
  },
  M3: {
    introductions: ["Meta Ads organise les actifs publicitaires autour de la campagne, des jeux d’annonces et des annonces.", "Le choix de l’objectif structure toute la campagne.", "Les audiences et le suivi des données permettent de mieux cibler les messages.", "L’optimisation vise une décision progressive et mesurée."],
    objectives: ["Structurer une campagne Meta", "Définir une audience", "Mesurer et ajuster le retour sur investissement"],
    sections: [
      { heading: "Structure de campagne", paragraphs: ["La structure est Campagne → Jeu d’annonces → Annonce. Le choix se fait dans cet ordre : objectif, audience, placements, budget puis créatif."], bullets: ["Objectif", "Audience", "Placements", "Budget", "Créatif"] },
      { heading: "Ciblage et mesure", paragraphs: ["Le ciblage peut combiner données démographiques, intérêts, comportements et audiences de retargeting. Le Pixel ou l’API de conversions mesure les actions importantes."], bullets: ["Portée", "Fréquence", "CTR", "Conversions"] },
      { heading: "Optimisation", paragraphs: ["Le pilotage suit le coût par résultat et le ROAS. Une seule variable est modifiée à la fois, avec un seuil d’arrêt ou de relance défini avant le lancement."], bullets: ["Tester", "Mesurer", "Comparer", "Décider"] },
    ],
  },
  M4: {
    introductions: ["Instagram Ads privilégie les formats immersifs et lisibles sur mobile.", "La campagne et les collaborations doivent poursuivre un objectif mesurable.", "La conversion se prépare en reliant contenu, offre et action attendue."],
    objectives: ["Choisir un format Instagram", "Préparer un brief de collaboration", "Relier un KPI à un objectif"],
    sections: [
      { heading: "Formats et création", paragraphs: ["Stories, Reels, carrousels et collections doivent rendre la proposition de valeur visible dès les premières secondes. Le format est choisi selon l’objectif de notoriété ou d’action."], bullets: ["Story", "Reel", "Carrousel", "Collection"] },
      { heading: "Influence et collaboration", paragraphs: ["Un partenaire est sélectionné selon la cohérence d’audience, la crédibilité, la qualité des interactions et la sécurité de marque. Le brief précise livrables, calendrier, rémunération et indicateurs."], bullets: ["Objectif", "Livrables", "Mentions", "Indicateurs"] },
      { heading: "Suivi", paragraphs: ["La portée et la mémorisation servent la notoriété ; les clics, essais ou messages servent l’action. Chaque résultat doit être interprété en fonction de l’objectif initial."], bullets: ["Portée", "Clics", "Messages", "Essais"] },
    ],
  },
  M5: {
    introductions: ["TikTok repose sur l’attention, la rétention et les interactions rapides.", "Les campagnes TikTok sont construites autour d’un format et d’un objectif précis.", "Les contenus sponsorisés doivent rester naturels et cohérents avec la marque.", "L’analyse compare la qualité des vues, des complétions et des interactions."],
    objectives: ["Créer un hook", "Choisir un format publicitaire", "Lire les indicateurs de rétention"],
    sections: [
      { heading: "Algorithme et rétention", paragraphs: ["La rétention, le taux de complétion et les interactions rapides influencent fortement la diffusion. La vidéo doit capter l’attention immédiatement et porter une idée principale."], bullets: ["Hook", "Rétention", "Complétion", "Interaction"] },
      { heading: "Création et campagnes", paragraphs: ["Un montage rythmé, du texte lisible et un CTA cohérent favorisent la compréhension. Les formats In-Feed et Spark Ads sont comparés selon l’objectif de campagne."], bullets: ["Idée unique", "Montage", "Texte lisible", "CTA"] },
      { heading: "Analyse", paragraphs: ["Les vues qualifiées, les complétions, les partages, les clics et le coût par résultat permettent d’ajuster une campagne sans perdre l’identité de marque."], bullets: ["Vues qualifiées", "Partages", "Clics", "Coût par résultat"] },
    ],
  },
  M6: {
    introductions: ["Le marketing conversationnel transforme une publicité en échange utile avec un prospect.", "Une campagne Click to WhatsApp doit préparer l’accueil et la qualification.", "Les réponses rapides et les scénarios soutiennent la relation sans remplacer les cas complexes.", "La qualité de réponse et le consentement sont des indicateurs essentiels."],
    objectives: ["Préparer une conversation", "Qualifier sans surcollecter", "Mesurer la qualité de réponse"],
    sections: [
      { heading: "Campagne conversationnelle", paragraphs: ["Une campagne Click to WhatsApp conduit vers une conversation utile avec consentement et promesse claire. Le message publicitaire et le message d’accueil sont préparés avant le lancement."], bullets: ["Consentement", "Promesse", "Message publicitaire", "Accueil"] },
      { heading: "Qualification et automatisation", paragraphs: ["Des questions courtes servent à comprendre le besoin, le budget ou le délai, sans collecter d’informations inutiles. L’humain reprend les demandes complexes."], bullets: ["Besoin", "Budget", "Délai", "Réponse humaine"] },
      { heading: "Suivi", paragraphs: ["Le délai de réponse, les conversations qualifiées, les rendez-vous et le taux de relance acceptable guident l’amélioration continue de la relation."], bullets: ["Délai", "Qualification", "Rendez-vous", "Relance"] },
    ],
  },
  M7: {
    introductions: ["Google Ads Search répond à une intention déjà exprimée dans une requête.", "Les mots-clés organisent le ciblage et la pertinence des annonces.", "Une annonce doit faire correspondre mot-clé, promesse et page de destination.", "L’optimisation s’appuie sur les requêtes et les conversions réelles."],
    objectives: ["Comprendre l’intention de recherche", "Structurer des groupes d’annonces", "Optimiser le coût par conversion"],
    sections: [
      { heading: "Intention et mots-clés", paragraphs: ["Les mots-clés sont distingués selon l’intention informationnelle, comparative ou transactionnelle. Cette intention guide le message et la page de destination."], bullets: ["Information", "Comparaison", "Action"] },
      { heading: "Annonce Search", paragraphs: ["Le mot-clé, le titre, la description et la page de destination doivent être alignés. Les groupes sont thématiques et les requêtes non pertinentes sont exclues."], bullets: ["Mot-clé", "Titre", "Description", "Page"] },
      { heading: "Optimisation", paragraphs: ["CTR, CPC, Quality Score, conversions et coût par conversion permettent d’ajuster les annonces, les enchères et les mots-clés à partir des requêtes réelles."], bullets: ["CTR", "CPC", "Quality Score", "Conversions"] },
    ],
  },
  M8: {
    introductions: ["Le référencement durable repose sur un contenu utile et une réponse claire à l’intention de recherche.", "Les mots-clés structurent les éléments importants d’une page.", "La technique et le mobile participent à l’expérience et à l’indexation.", "Le SEO local renforce la visibilité d’une activité de proximité."],
    objectives: ["Comprendre l’intention de recherche", "Optimiser une page", "Auditer la visibilité locale"],
    sections: [
      { heading: "Fondamentaux SEO", paragraphs: ["Le référencement s’appuie sur un contenu utile, une structure technique saine et des signaux de confiance. La priorité est de répondre précisément à la question de l’internaute."], bullets: ["Contenu", "Technique", "Confiance", "Intention"] },
      { heading: "Optimisation on-page", paragraphs: ["Le mot-clé principal guide le titre, le H1, l’URL, les sous-titres et le contenu sans sur-optimisation. La rédaction privilégie d’abord la clarté."], bullets: ["Title", "H1", "URL", "Sous-titres"] },
      { heading: "Technique et local", paragraphs: ["Vitesse, mobile, indexation, liens internes et erreurs sont vérifiés dans un audit. Google Business Profile rassemble catégories, horaires, photos et avis pour une présence locale."], bullets: ["Vitesse", "Mobile", "Indexation", "Google Business Profile"] },
    ],
  },
  M9: {
    introductions: ["L’e-mail marketing commence par un consentement clair et une promesse utile.", "La segmentation améliore la pertinence du message.", "Les scénarios automatisés organisent les étapes de la relation.", "L’objet, le contenu et le CTA influencent l’ouverture et la conversion."],
    objectives: ["Obtenir un consentement", "Structurer une séquence", "Mesurer et tester un envoi"],
    sections: [
      { heading: "Consentement et segmentation", paragraphs: ["Un lead magnet apporte une valeur réelle, comme un guide ou une checklist, en échange d’une adresse e-mail avec consentement. La segmentation s’appuie sur le besoin, l’intérêt ou le comportement."], bullets: ["Valeur", "Consentement", "Besoin", "Comportement"] },
      { heading: "Welcome series", paragraphs: ["La séquence d’accueil présente la marque, délivre la promesse, répond aux objections et propose une action progressive. Chaque e-mail porte une idée principale."], bullets: ["Objet", "Valeur", "CTA", "Désinscription"] },
      { heading: "Optimisation", paragraphs: ["Délivrabilité, ouvertures, clics, conversions et désabonnements servent à décider. Une seule variable est testée à la fois : objet, promesse ou CTA."], bullets: ["Délivrabilité", "Ouvertures", "Clics", "Conversions"] },
    ],
  },
  M10: {
    introductions: ["Les indicateurs prennent leur valeur lorsqu’ils conduisent à une décision.", "GA4 permet de lire les événements, conversions, contenus et sources de trafic.", "Un tableau de bord transforme les données en une lecture claire.", "La veille soutient l’apprentissage et l’anticipation."],
    objectives: ["Choisir un KPI utile", "Interpréter GA4", "Formuler une recommandation fondée sur les données"],
    sections: [
      { heading: "KPIs essentiels", paragraphs: ["Le ROAS mesure le chiffre d’affaires attribué divisé par les dépenses. Le CTR rapporte les clics aux impressions. L’engagement rapporte les interactions à la portée ou aux impressions."], bullets: ["ROAS", "CTR", "Engagement", "Écart à l’objectif"] },
      { heading: "Google Analytics 4", paragraphs: ["L’analyse s’appuie sur les événements et conversions définis pour le parcours. Les sources de trafic, contenus, campagnes et périodes équivalentes sont comparés avant toute conclusion."], bullets: ["Événements", "Conversions", "Sources", "Périodes"] },
      { heading: "Rapport et veille", paragraphs: ["Un tableau de bord utile montre l’évolution, l’écart à l’objectif, une cause probable et une recommandation. La veille surveille tendances, concurrents et plateformes."], bullets: ["Évolution", "Écart", "Cause", "Recommandation"] },
    ],
  },
  BD1: {
    introductions: ["L’économie numérique s’appuie sur la dématérialisation, les données, la connectivité et les plateformes.", "L’identité de marque associe mission, vision, valeurs, avatar client et positionnement.", "Une stratégie digitale relie des objectifs SMART à un parcours client et à des leviers mesurables."],
    objectives: ["Comprendre les leviers d’acquisition", "Construire un avatar client", "Maîtriser le parcours Awareness, Consideration, Conversion, Loyalty"],
    sections: [
      { heading: "Introduction au marketing digital et écosystème", paragraphs: ["Le marketing digital regroupe les pratiques visant à promouvoir des produits ou services via les canaux numériques. Les principaux leviers d’acquisition comprennent le SEO, le SEA, le SMA, le SMO et l’e-mailing."], bullets: ["SEO : référencement naturel", "SEA : publicité payante", "SMA : publicité sociale", "SMO : optimisation sociale", "E-mailing"] },
      { heading: "Parcours client", paragraphs: ["Le parcours client se décompose en quatre phases : Awareness, Consideration, Conversion et Loyalty. Chaque phase demande des points de contact cohérents et un message adapté au niveau de maturité du prospect."], bullets: ["Awareness : prise de conscience", "Consideration : considération", "Conversion : achat ou action", "Loyalty : fidélisation"] },
      { heading: "Identité de marque et avatar client", paragraphs: ["L’architecture de marque repose sur la mission, la vision et les valeurs. L’avatar client décrit données démographiques, besoins, douleurs, désirs, aspirations et freins. La charte graphique et le ton de voix assurent une expression cohérente."], bullets: ["Mission, vision, valeurs", "Avatar client", "Positionnement", "Ton de voix"] },
    ],
    table: { headers: ["Période", "Volume horaire", "Focus principal"], rows: [["Mois 1", "6 h / semaine", "Fondamentaux, branding et Community Management"], ["Mois 2", "6 h / semaine", "Meta Ads, Google Ads, e-mailing et finance"], ["Mois 3", "6 h / semaine", "Analyse de données, KPIs Data-driven et soft skills"]] },
  },
  BD2: {
    introductions: ["Les plateformes sociales sont sélectionnées selon la cible, l’objectif et le contexte B2B ou B2C.", "La ligne éditoriale organise le ton, les piliers et les appels à l’action.", "Le calendrier transforme les idées en contenus réguliers et mesurables."],
    objectives: ["Choisir une plateforme", "Construire une ligne éditoriale", "Planifier et produire des contenus"],
    sections: [
      { heading: "Plateformes et formats", paragraphs: ["Les algorithmes valorisent la pertinence, la régularité et les interactions rapides. Le format choisi doit servir l’objectif du contenu et les habitudes de la cible."], bullets: ["Cible", "Objectif", "Format", "Interaction"] },
      { heading: "Ligne éditoriale et copywriting", paragraphs: ["Une ligne éditoriale équilibre contenu promotionnel, éducatif et divertissant. Une légende combine une accroche, une valeur, une preuve et un appel à l’action."], bullets: ["Accroche", "Valeur", "Preuve", "CTA"] },
      { heading: "Calendrier et production", paragraphs: ["Canva aide à produire les visuels, CapCut les formats courts, et Notion ou Trello la planification. La cohérence de marque, la lisibilité mobile et l’appel à l’action sont vérifiés avant publication."], bullets: ["Planifier", "Produire", "Vérifier", "Animer"] },
    ],
  },
  BD3: {
    introductions: ["Dans Meta Ads, la campagne fixe l’objectif, l’ensemble d’annonces règle l’audience et le budget, et la publicité porte le créatif.", "Les tests A/B comparent une variable de créatif, de texte ou d’audience.", "Le retargeting et Google Search relient les audiences à l’intention de recherche."],
    objectives: ["Structurer une campagne", "Tester un créatif", "Piloter CTR, fréquence et ROAS"],
    sections: [
      { heading: "Meta Ads et audiences", paragraphs: ["Une audience définie, un message unique et un indicateur de succès rendent une campagne lisible. L’objectif doit précéder le budget, le placement et le créatif."], bullets: ["Campagne", "Audience", "Budget", "Créatif"] },
      { heading: "Créatifs et optimisation", paragraphs: ["Les tests comparent créatif, accroche et audience. Portée, impressions, fréquence, CTR et coût par résultat servent au pilotage des objectifs de branding."], bullets: ["Portée", "Impressions", "Fréquence", "CTR"] },
      { heading: "Retargeting et Google Search", paragraphs: ["Les audiences froides, tièdes et chaudes reçoivent des messages différents. Google Search capte une intention exprimée grâce aux mots-clés, annonces pertinentes et Quality Score."], bullets: ["Froid", "Tiède", "Chaud", "ROAS"] },
    ],
  },
  BD4: {
    introductions: ["La finance marketing relie dépenses, acquisition et valeur créée.", "Le budget traduit les priorités de la stratégie en allocations mesurables.", "La gestion de projet rend les tâches, décisions et résultats compréhensibles pour le client."],
    objectives: ["Calculer des ratios", "Construire un budget", "Présenter un reporting client"],
    sections: [
      { heading: "Métriques financières", paragraphs: ["Le CAC est le total des dépenses marketing divisé par les nouveaux clients. La LTV représente la valeur client sur la durée. Une LTV supérieure au CAC est indispensable pour une acquisition durable."], bullets: ["Chiffre d’affaires", "Marge", "ROI", "ROAS", "CAC", "LTV"] },
      { heading: "Budget et arbitrage", paragraphs: ["Chaque levier reçoit une hypothèse, une cible de résultat et une règle d’ajustement. Le suivi hebdomadaire compare budget prévu, dépensé, résultat et décision suivante."], bullets: ["Hypothèse", "Cible", "Écart", "Décision"] },
      { heading: "Pilotage de mission", paragraphs: ["Trello organise À faire, En cours, Bloqué et Terminé. Notion documente les décisions, apprentissages et reportings. Le reporting transforme les données en décisions actionnables."], bullets: ["Priorités", "Avancement", "Décisions", "Reporting"] },
    ],
  },
  BD5: {
    introductions: ["Un lead magnet apporte une valeur précise en échange d’un contact obtenu avec consentement.", "La séquence de bienvenue accompagne le contact avec un rythme et un CTA adaptés.", "La fidélisation combine satisfaction, valeur relationnelle et mesure du NPS."],
    objectives: ["Créer un lead magnet", "Organiser un nurturing", "Mesurer le NPS et la rétention"],
    sections: [
      { heading: "Lead magnet et consentement", paragraphs: ["Le lead magnet résout un problème précis contre une adresse e-mail obtenue avec consentement. Il doit annoncer clairement la valeur proposée et respecter le choix du contact."], bullets: ["Valeur", "Consentement", "Promesse", "Qualification"] },
      { heading: "Automatisation et nurturing", paragraphs: ["La séquence de bienvenue délivre la valeur promise, instaure la confiance et prépare une action utile. La segmentation, les déclencheurs et les scénarios évitent la sur-sollicitation."], bullets: ["Segmentation", "Déclencheur", "Rythme", "CTA"] },
      { heading: "Fidélisation et NPS", paragraphs: ["Le NPS correspond au pourcentage de promoteurs moins le pourcentage de détracteurs. Un programme de fidélisation peut réunir points, avantages ou parrainage, puis mesurer son effet sur la rétention."], bullets: ["NPS", "Churn", "Parrainage", "Rétention"] },
    ],
  },
  BD6: {
    introductions: ["GA4 analyse des événements tels que scroll, clic, vidéo terminée ou formulaire envoyé.", "Les KPIs donnent une lecture commune de la progression digitale.", "La consultance relie données, interprétation, recommandations et prochains tests."],
    objectives: ["Lire les sources de trafic", "Construire un tableau de bord", "Présenter une recommandation priorisée"],
    sections: [
      { heading: "GA4 et sources de trafic", paragraphs: ["Les événements mesurent les comportements importants. Le trafic organique, payant, direct et social est comparé sur des périodes comparables avant d’interpréter une évolution."], bullets: ["Scroll", "Clic", "Vidéo", "Formulaire"] },
      { heading: "KPIs et tableau de bord", paragraphs: ["Le taux d’engagement, la portée organique, le taux d’interaction, le NPS et la croissance d’abonnés doivent posséder une formule, une cible et une décision associée."], bullets: ["Formule", "Cible", "Écart", "Décision"] },
      { heading: "Consultance", paragraphs: ["Un rapport mensuel présente les données, les tendances, leur interprétation, des recommandations priorisées et les prochains tests. La veille s’appuie sur les sources sectorielles et l’observation concurrentielle."], bullets: ["Données", "Tendances", "Recommandations", "Prochains tests"] },
    ],
  },
};

const extraSections: Record<string, LessonTranscript["sections"]> = {
  M1: [
    { heading: "Posture et compétences du Community Manager", paragraphs: ["Le Community Manager observe les attentes de la communauté, traduit la stratégie de marque en contenus et coordonne les réponses. Il combine écoute, rédaction, organisation, analyse et maîtrise des codes de chaque plateforme."], bullets: ["Écouter les signaux de la communauté", "Appliquer le ton de voix de la marque", "Coordonner les réponses et alertes"] },
    { heading: "Calendrier éditorial opérationnel", paragraphs: ["Le calendrier répartit les contenus dans le temps et évite les publications improvisées. Chaque ligne précise le pilier éditorial, le format, la date, le responsable, l’appel à l’action et le statut de production."], bullets: ["Choisir le pilier de contenu", "Définir le format et la date", "Contrôler la publication et le suivi"] },
  ],
  M2: [
    { heading: "Création graphique avec Canva", paragraphs: ["Un visuel professionnel met en avant une idée principale, un contraste lisible et une charte cohérente. La composition respecte la hiérarchie : titre, élément visuel, preuve et appel à l’action."], bullets: ["Préserver la lisibilité mobile", "Respecter la charte graphique", "Créer une hiérarchie visuelle claire"] },
    { heading: "Montage vidéo et publication", paragraphs: ["Une vidéo courte est préparée par un storyboard : hook, développement, preuve ou démonstration, puis appel à l’action. La publication adapte la légende, les sous-titres, le format et l’horaire à chaque réseau."], bullets: ["Préparer un storyboard", "Ajouter des sous-titres", "Adapter la diffusion au réseau"] },
  ],
  M3: [
    { heading: "Optimisation et retour sur investissement", paragraphs: ["L’optimisation compare les résultats au coût engagé. Après une période d’apprentissage suffisante, on analyse la fréquence, le CTR, le coût par résultat, les conversions et le ROAS avant d’ajuster une variable."], bullets: ["Définir un seuil de décision", "Ajuster une seule variable", "Mesurer le ROAS et les conversions"] },
  ],
  M5: [
    { heading: "Atelier pratique et analyse des performances", paragraphs: ["L’atelier réunit la création, la publication et l’analyse d’une vidéo. Le bilan compare vues qualifiées, durée moyenne de visionnage, taux de complétion, partages, clics et coût par résultat."], bullets: ["Publier un contenu test", "Lire la rétention et les complétions", "Formuler une amélioration précise"] },
  ],
  M6: [
    { heading: "Analyse et optimisation des conversations", paragraphs: ["L’analyse vérifie si la campagne déclenche des conversations utiles et si les réponses conduisent vers une action réaliste. Les délais, questions fréquentes, qualifications et relances permettent d’améliorer le scénario."], bullets: ["Mesurer le délai de réponse", "Identifier les conversations qualifiées", "Améliorer le scénario de relance"] },
  ],
  M7: [
    { heading: "Optimisation et analyse Google Ads", paragraphs: ["Le rapport de recherche révèle les requêtes réellement saisies. Il permet d’ajouter des mots-clés négatifs, de renforcer les groupes pertinents et d’adapter les enchères selon les conversions observées."], bullets: ["Lire les termes de recherche", "Exclure les requêtes inutiles", "Ajuster selon les conversions"] },
  ],
  M8: [
    { heading: "Audit SEO et visibilité locale", paragraphs: ["Un audit relie le contenu, les performances techniques et la visibilité locale. Il priorise les problèmes selon leur impact, puis organise les corrections sur les pages, liens, fiches locales et avis."], bullets: ["Prioriser les problèmes", "Optimiser Google Business Profile", "Suivre la visibilité locale"] },
  ],
  M9: [
    { heading: "Taux d’ouverture et conversion", paragraphs: ["Le taux d’ouverture dépend notamment de l’objet et de la confiance accordée à l’expéditeur. Le taux de clic et la conversion dépendent d’une promesse claire, d’un contenu utile et d’un appel à l’action visible."], bullets: ["Tester un objet", "Clarifier la promesse", "Mesurer clics et conversions"] },
  ],
  M10: [
    { heading: "Décision data-driven et veille", paragraphs: ["Une décision data-driven formule une hypothèse, teste une action, mesure l’écart et apprend du résultat. La veille documente les évolutions de plateformes, concurrents, tendances et attentes de la cible."], bullets: ["Formuler une hypothèse", "Tester et mesurer", "Documenter les apprentissages"] },
  ],
};

const lessonSectionOrder: Record<string, number[]> = {
  M1: [0, 3, 1, 4, 2],
  M2: [0, 1, 3, 4, 2],
  M3: [0, 1, 2, 3],
  M4: [0, 1, 2],
  M5: [0, 1, 2, 3],
  M6: [0, 1, 2, 3],
  M7: [0, 1, 2, 3],
  M8: [0, 1, 2, 3],
  M9: [0, 1, 2, 3],
  M10: [0, 1, 2, 3],
  BD1: [0, 2, 1],
  BD2: [0, 1, 2],
  BD3: [0, 1, 2],
  BD4: [0, 1, 2],
  BD5: [0, 1, 2],
  BD6: [0, 1, 2],
};

export function getLessonTranscript(moduleCode: string, lessonSequence: number, lesson: { title: string; summary?: string }): LessonTranscript {
  const module = source[moduleCode] || source.PREC;
  const allSections = [...module.sections, ...(extraSections[moduleCode] || [])];
  const orderedIndex = lessonSectionOrder[moduleCode]?.[lessonSequence - 1] ?? lessonSequence - 1;
  const sectionIndex = Math.min(Math.max(orderedIndex, 0), allSections.length - 1);
  const section = allSections[sectionIndex];
  const practiceSection = {
    heading: `Application guidée — ${lesson.title}`,
    paragraphs: [`Pour maîtriser cette leçon, reliez les notions étudiées à une situation réelle : identifiez l’objectif, choisissez les éléments adaptés puis justifiez votre décision avec le vocabulaire et les indicateurs présentés dans le cours.`, `Avant de passer à la suite, vérifiez que vous savez expliquer chaque objectif de la leçon, reconnaître son utilisation concrète et produire un exemple cohérent avec une marque, une campagne ou un public cible.`],
    bullets: ["Identifier le besoin ou la situation", "Appliquer la méthode ou le levier adapté", "Justifier la décision avec un indicateur ou une preuve"],
  };
  return {
    introduction: module.introductions[Math.min(lessonSequence - 1, module.introductions.length - 1)] || lesson.summary || "",
    objectives: section.bullets?.slice(0, 3) || module.objectives,
    sections: [section, practiceSection],
    table: lessonSequence === 1 ? module.table : undefined,
  };
}
