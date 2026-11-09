export const FORMATIVE_SIMULATION_CODE = "SIM-BD-NAYA-02";
export const FORMATIVE_SIMULATION_DURATION_SECONDS = 90 * 60;
export const FORMATIVE_THEORY_DURATION_SECONDS = 30 * 60;

export type SimulationChoiceSeed = {
  id: string;
  label: string;
  consequence: string;
  feedback: string;
  score: number;
  metrics: { budget: number; visibility: number; engagement: number; prospects: number; satisfaction: number };
};

export type SimulationStepSeed = {
  id: string;
  sequence: number;
  title: string;
  context: string;
  objective: string;
  imageKey: "hero" | "client" | "analytics";
  choices: SimulationChoiceSeed[];
};

const c = (id: string, label: string, consequence: string, feedback: string, score: number, metrics: SimulationChoiceSeed["metrics"]): SimulationChoiceSeed => ({ id, label, consequence, feedback, score, metrics });

export const nayaSimulationSteps: SimulationStepSeed[] = [
  {
    id: "audit-signal", sequence: 1, title: "Phase 1 · Lire le signal faible",
    context: "Naya Conseil lance une offre de formation destinée aux jeunes actifs et aux responsables de petites organisations. Les données des trois derniers mois sont incomplètes : les publications ont généré 42 000 impressions, mais seulement 118 demandes d’information. La direction veut communiquer dès lundi.",
    objective: "Quelle première décision permet de transformer ces données imparfaites en diagnostic exploitable ?",
    imageKey: "hero",
    choices: [
      c("audit-signal-a", "Construire une hypothèse par segment, vérifier les sources et établir une ligne de base avant d’investir", "Vous ralentissez le lancement de 48 heures, mais vous distinguez enfin portée, clics qualifiés et demandes réellement attribuables.", "La bonne décision ne consiste pas à attendre des données parfaites : elle consiste à expliciter l’incertitude et à fixer une base comparable.", 10, { budget: 0, visibility: 2, engagement: 4, prospects: 3, satisfaction: 7 }),
      c("audit-signal-b", "Retenir le taux d’engagement global comme indicateur principal et lancer les contenus les plus populaires", "Le volume de réactions augmente, mais vous ne savez toujours pas si les personnes intéressées correspondent à la cible solvable.", "Un indicateur de vanité peut orienter la création, mais il ne suffit pas à établir un diagnostic d’acquisition.", 6, { budget: 0, visibility: 6, engagement: 5, prospects: 0, satisfaction: -1 }),
      c("audit-signal-c", "Attribuer toutes les demandes au dernier canal visible et réallouer immédiatement le budget", "La réallocation semble rationnelle, mais elle confond exposition, influence et conversion finale.", "Une attribution au dernier clic sans contrôle des parcours peut conduire à optimiser le mauvais levier.", 4, { budget: -80000, visibility: 5, engagement: -1, prospects: 1, satisfaction: -4 }),
    ],
  },
  {
    id: "segments", sequence: 2, title: "Phase 1 · Arbitrer entre deux segments",
    context: "L’enquête rapide fait apparaître deux segments : les jeunes actifs recherchent une progression de carrière, tandis que les responsables recherchent une solution applicable en équipe. Le budget ne permet pas de produire deux campagnes complètes dès la première semaine.",
    objective: "Comment prioriser sans fermer prématurément le second segment ?",
    imageKey: "client",
    choices: [
      c("segments-a", "Choisir un segment d’entrée, définir l’autre comme audience secondaire et documenter les critères de bascule", "La campagne démarre avec une promesse nette, tout en conservant un test léger pour mesurer le potentiel du second segment.", "Une segmentation utile comporte une priorité opérationnelle, des critères de décision et une porte de révision.", 10, { budget: -20000, visibility: 5, engagement: 6, prospects: 5, satisfaction: 7 }),
      c("segments-b", "Adresser les deux segments avec une promesse moyenne afin de ne frustrer personne", "Le message reste acceptable pour tous, mais il ne déclenche une préférence forte chez personne.", "La neutralité peut réduire le risque apparent tout en affaiblissant la pertinence et la mémorisation.", 5, { budget: -10000, visibility: 4, engagement: 1, prospects: 2, satisfaction: 0 }),
      c("segments-c", "Choisir uniquement le segment ayant le plus grand volume et ignorer la valeur potentielle de l’autre", "Le volume initial est prometteur, mais vous perdez un signal stratégique sur le panier moyen et la recommandation.", "Le volume n’est pas le seul critère : valeur, accessibilité, urgence et capacité de service comptent aussi.", 6, { budget: -15000, visibility: 7, engagement: 2, prospects: 3, satisfaction: -2 }),
    ],
  },
  {
    id: "promise", sequence: 3, title: "Phase 1 · Tester la promesse",
    context: "Deux formulations sont disponibles. A promet une montée en compétence rapide ; B promet une méthode directement applicable avec accompagnement. Les preuves actuelles sont trois témoignages et un atelier pilote, mais aucun résultat standardisé.",
    objective: "Quelle formulation protège la crédibilité tout en permettant un test de marché ?",
    imageKey: "client",
    choices: [
      c("promise-a", "Formuler un bénéfice observable, préciser les conditions de réussite et relier la promesse aux preuves disponibles", "La promesse est moins spectaculaire mais les premiers échanges sont plus qualifiés et les objections deviennent exploitables.", "Une promesse testable est préférable à une garantie absolue lorsque les preuves sont encore limitées.", 10, { budget: 0, visibility: 3, engagement: 6, prospects: 5, satisfaction: 8 }),
      c("promise-b", "Conserver la promesse la plus ambitieuse et ajouter une mention générale de résultats variables", "Le taux de clic monte, mais les prospects demandent des garanties que l’équipe ne peut pas documenter.", "Une précaution juridique ne corrige pas une promesse marketing dont le niveau d’attente est disproportionné.", 5, { budget: 0, visibility: 8, engagement: 0, prospects: 3, satisfaction: -5 }),
      c("promise-c", "Ne communiquer que sur les caractéristiques du programme jusqu’à obtenir davantage de témoignages", "Le message est exact mais peu différenciant ; l’équipe obtient peu de demandes pour apprendre.", "La prudence n’interdit pas de formuler un bénéfice : elle demande de le rendre précis et vérifiable.", 7, { budget: 0, visibility: 1, engagement: 3, prospects: 2, satisfaction: 4 }),
    ],
  },
  {
    id: "journey", sequence: 4, title: "Phase 1 · Dessiner le parcours",
    context: "Les visiteurs arrivent depuis des contenus différents. Certains demandent le programme, d’autres le prix, d’autres encore veulent savoir si la formation convient à leur situation. L’équipe ne peut traiter manuellement que 25 conversations par jour.",
    objective: "Quel parcours réduit la friction sans automatiser la relation trop tôt ?",
    imageKey: "hero",
    choices: [
      c("journey-a", "Proposer une ressource de qualification, trois chemins de réponse et un rendez-vous seulement après un besoin explicité", "Les demandes sont mieux orientées et l’équipe réserve son temps aux conversations où une décision est réellement possible.", "Un parcours efficace réduit l’effort demandé au prospect tout en donnant un contexte exploitable à l’équipe.", 10, { budget: -30000, visibility: 2, engagement: 7, prospects: 8, satisfaction: 8 }),
      c("journey-b", "Envoyer tout le monde vers un formulaire long afin de collecter un maximum de renseignements", "La base s’enrichit, mais une partie des visiteurs abandonne avant de formuler son besoin.", "La quantité de champs ne garantit pas la qualité du signal : chaque question doit servir une décision.", 6, { budget: -10000, visibility: 0, engagement: -2, prospects: 3, satisfaction: -2 }),
      c("journey-c", "Inviter directement à un rendez-vous pour ne perdre aucun prospect intéressé", "Le calendrier se remplit, mais les échanges sont hétérogènes et le taux de présence baisse.", "La prise de rendez-vous immédiate peut convenir à une intention forte, pas à tous les niveaux de maturité.", 6, { budget: -15000, visibility: 1, engagement: 2, prospects: 4, satisfaction: -3 }),
    ],
  },
  {
    id: "content-architecture", sequence: 5, title: "Phase 2 · Construire le système de contenus",
    context: "La direction demande 16 publications en quatre semaines. Vous disposez de deux experts, d’un designer à mi-temps et de contenus bruts issus de l’atelier pilote. Le risque principal est de produire beaucoup sans faire progresser la décision du public.",
    objective: "Quelle architecture éditoriale permet d’apprendre et de convertir progressivement ?",
    imageKey: "client",
    choices: [
      c("content-architecture-a", "Organiser les contenus par étapes : problème, preuve, méthode, objection, invitation, avec un objectif mesurable par publication", "La production devient plus exigeante, mais chaque contenu joue un rôle identifiable dans le parcours.", "Une ligne éditoriale performante relie la variété des formats à une progression de confiance et d’action.", 10, { budget: -45000, visibility: 6, engagement: 8, prospects: 6, satisfaction: 7 }),
      c("content-architecture-b", "Répartir les 16 publications à parts égales entre les thèmes proposés", "Le calendrier est équilibré visuellement, mais certains contenus ne répondent à aucune question prioritaire.", "Une répartition mécanique ne remplace pas une hiérarchie fondée sur les besoins et les signaux du parcours.", 6, { budget: -30000, visibility: 4, engagement: 3, prospects: 2, satisfaction: 1 }),
      c("content-architecture-c", "Concentrer la production sur les témoignages, car ils sont déjà disponibles", "Les preuves rassurent une partie du public, mais l’offre reste difficile à comprendre pour les nouveaux visiteurs.", "La preuve est utile après ou pendant l’explication de la valeur ; elle ne remplace pas la pédagogie.", 7, { budget: -35000, visibility: 5, engagement: 5, prospects: 3, satisfaction: 4 }),
    ],
  },
  {
    id: "channel-test", sequence: 6, title: "Phase 2 · Concevoir un test multicanal",
    context: "Après une semaine, LinkedIn génère peu de volume mais des commentaires détaillés. Instagram génère davantage de portée, avec une qualification inconnue. Une newsletter existante compte 1 800 abonnés, mais la segmentation est faible.",
    objective: "Quel protocole de test permet de comparer les canaux sans les juger sur le même rôle ?",
    imageKey: "analytics",
    choices: [
      c("channel-test-a", "Attribuer un rôle à chaque canal, conserver un message commun et comparer des événements de parcours équivalents", "Vous distinguez la contribution à la confiance, à la découverte et à la demande au lieu de chercher un vainqueur unique.", "Les canaux ne servent pas nécessairement la même étape ; la comparaison doit porter sur des événements comparables.", 10, { budget: -25000, visibility: 5, engagement: 7, prospects: 7, satisfaction: 6 }),
      c("channel-test-b", "Comparer uniquement le coût par clic en diffusant le même visuel partout", "Instagram paraît supérieur, mais la qualité réelle des visites et la contribution de la newsletter restent invisibles.", "Le coût par clic est utile pour piloter l’achat, pas pour conclure seul sur la valeur d’un canal.", 5, { budget: -40000, visibility: 8, engagement: 0, prospects: 2, satisfaction: -2 }),
      c("channel-test-c", "Abandonner le canal à faible volume et concentrer toute l’équipe sur celui qui génère le plus de portée", "Le volume augmente, mais les conversations expertes qui nourrissaient la preuve disparaissent.", "Un canal de faible volume peut être stratégique s’il produit des signaux de forte intention.", 6, { budget: -20000, visibility: 9, engagement: -1, prospects: 3, satisfaction: 0 }),
    ],
  },
  {
    id: "budget-arbitrage", sequence: 7, title: "Phase 2 · Arbitrer le budget de lancement",
    context: "Il reste 420 000 FCFA. Trois dépenses sont possibles : 180 000 pour la production, 160 000 pour la diffusion payante et 80 000 pour l’analyse et les tests. La direction veut une décision unique aujourd’hui.",
    objective: "Quel arbitrage maximise l’apprentissage sans sacrifier la capacité de diffusion ?",
    imageKey: "analytics",
    choices: [
      c("budget-arbitrage-a", "Financer les trois postes, mais libérer la diffusion en deux vagues conditionnées par des seuils", "Vous gardez une capacité d’ajustement : le second investissement dépend de signaux observés plutôt que d’un pari initial.", "Un budget progressif réduit le risque d’engager toute la ressource avant d’avoir validé le message.", 10, { budget: -420000, visibility: 10, engagement: 8, prospects: 9, satisfaction: 6 }),
      c("budget-arbitrage-b", "Mettre 300 000 en diffusion dès le départ et réduire la production au strict minimum", "La campagne obtient une portée rapide, mais le manque de variantes ralentit l’apprentissage et augmente la fatigue.", "La diffusion amplifie un système ; elle ne compense pas une proposition ou des créations insuffisamment testées.", 6, { budget: -420000, visibility: 13, engagement: 1, prospects: 5, satisfaction: -1 }),
      c("budget-arbitrage-c", "Réserver la plus grande part à l’analyse et attendre un niveau de certitude supérieur avant de diffuser", "La qualité du suivi progresse, mais le marché ne fournit pas assez de réactions nouvelles pour valider les hypothèses.", "La mesure doit soutenir l’action ; elle ne doit pas devenir un substitut à l’expérimentation contrôlée.", 7, { budget: -420000, visibility: 1, engagement: 4, prospects: 2, satisfaction: 5 }),
    ],
  },
  {
    id: "landing-page", sequence: 8, title: "Phase 2 · Réparer la page de destination",
    context: "La campagne a généré 1 260 visites en trois jours. 19 % cliquent sur le bouton principal, mais seulement 2,4 % complètent la demande. Les cartes de suivi montrent que la majorité quitte après la section tarifaire.",
    objective: "Quelle intervention doit être testée en premier ?",
    imageKey: "hero",
    choices: [
      c("landing-page-a", "Observer les abandons, clarifier la valeur avant le tarif et tester une preuve contextualisée avec un formulaire plus court", "La friction principale se déplace : les visiteurs comprennent mieux l’offre et les demandes deviennent plus qualifiées.", "La bonne optimisation part d’un comportement observé et teste une hypothèse précise, pas une refonte esthétique globale.", 10, { budget: -20000, visibility: 0, engagement: 7, prospects: 10, satisfaction: 8 }),
      c("landing-page-b", "Réduire fortement le tarif affiché pour faire remonter le taux de conversion", "Le taux de demande progresse, mais les prospects attirés négocient davantage et la perception de valeur se dégrade.", "Une baisse de prix peut être un test, mais elle ne doit pas masquer une incompréhension de la valeur.", 5, { budget: 0, visibility: 0, engagement: 1, prospects: 6, satisfaction: -6 }),
      c("landing-page-c", "Ajouter davantage de textes et de témoignages avant le formulaire", "La page paraît plus rassurante, mais la décision devient plus longue et la cause de l’abandon reste incertaine.", "Ajouter de l’information sans hiérarchiser peut accroître la charge cognitive au lieu de traiter l’objection.", 6, { budget: -10000, visibility: 0, engagement: 3, prospects: 4, satisfaction: 1 }),
    ],
  },
  {
    id: "lead-qualification", sequence: 9, title: "Phase 3 · Qualifier sans exclure",
    context: "La campagne produit maintenant 14 demandes par jour. L’équipe constate que 40 % des demandes sont encore exploratoires, tandis que les responsables d’équipe attendent une réponse sous 24 heures. Le formulaire doit évoluer sans rendre l’accès opaque.",
    objective: "Quelle règle de qualification est la plus équilibrée ?",
    imageKey: "client",
    choices: [
      c("lead-qualification-a", "Ajouter quelques questions liées à l’objectif et au délai, puis proposer une ressource adaptée à chaque niveau", "Les priorités deviennent visibles sans punir les personnes qui ne sont pas encore prêtes à prendre rendez-vous.", "La qualification sert à personnaliser la suite ; elle ne doit pas transformer l’incertitude en exclusion.", 10, { budget: -15000, visibility: 1, engagement: 7, prospects: 9, satisfaction: 8 }),
      c("lead-qualification-b", "Réserver l’accès au rendez-vous aux prospects ayant déclaré un budget précis", "Le calendrier se vide et le taux de qualification monte artificiellement, mais des opportunités pertinentes disparaissent.", "Un budget déclaré n’est pas toujours disponible ni comparable ; en faire une barrière trop tôt déforme le signal.", 5, { budget: 0, visibility: -1, engagement: -1, prospects: 4, satisfaction: -5 }),
      c("lead-qualification-c", "Ne rien changer et traiter les demandes dans leur ordre d’arrivée", "Les demandes simples consomment du temps alors que les situations urgentes attendent.", "L’absence de règle est aussi une règle : elle favorise souvent le hasard plutôt que l’équité de traitement.", 6, { budget: 0, visibility: 0, engagement: 2, prospects: 5, satisfaction: -3 }),
    ],
  },
  {
    id: "crm-sequence", sequence: 10, title: "Phase 3 · Orchestrer la relation",
    context: "Une partie des personnes ne répond pas après le premier échange. Vous disposez d’un outil de suivi simple et d’un consentement explicite pour les messages utiles. Le formateur veut une séquence qui ne donne pas l’impression d’un automatisme agressif.",
    objective: "Quelle séquence combine pertinence, rythme et possibilité de sortie ?",
    imageKey: "client",
    choices: [
      c("crm-sequence-a", "Envoyer un récapitulatif personnalisé, une ressource liée au besoin, puis une relance avec choix de rythme", "Les contacts peuvent avancer à leur cadence et l’équipe récupère des signaux de préférence utiles.", "La relation automatisée reste acceptable lorsqu’elle apporte une valeur identifiable et laisse un contrôle réel.", 10, { budget: -10000, visibility: 1, engagement: 9, prospects: 8, satisfaction: 9 }),
      c("crm-sequence-b", "Relancer à fréquence fixe jusqu’à obtenir une réponse ou une désinscription", "Le volume de réponses augmente légèrement, mais les irritations et les sorties de liste progressent aussi.", "La persistance sans adaptation confond pression et accompagnement.", 4, { budget: -5000, visibility: 2, engagement: -4, prospects: 3, satisfaction: -8 }),
      c("crm-sequence-c", "N’envoyer qu’un message supplémentaire pour rester prudent, sans distinguer les besoins", "La pression reste faible, mais les contacts qui avaient besoin d’une précision ne reçoivent pas la bonne aide.", "La sobriété est utile, mais la pertinence dépend aussi du contexte et du contenu proposé.", 7, { budget: -5000, visibility: 0, engagement: 4, prospects: 5, satisfaction: 5 }),
    ],
  },
  {
    id: "crisis-response", sequence: 11, title: "Phase 3 · Répondre à un signal critique",
    context: "Un commentaire public affirme que le programme est trop général et qu’un témoignage est exagéré. La publication est déjà partagée. L’auteur accepte de poursuivre l’échange en public, mais demande une réponse dans l’heure.",
    objective: "Quelle réponse protège la confiance sans transformer le commentaire en débat défensif ?",
    imageKey: "hero",
    choices: [
      c("crisis-response-a", "Reconnaître le point précis, vérifier le témoignage, apporter un élément vérifiable et proposer un échange transparent", "La discussion se recentre sur les faits ; l’équipe corrige une formulation et publie ensuite une précision accessible à tous.", "Une réponse de crise utile traite le fond, distingue l’erreur de l’opinion et rend la correction visible.", 10, { budget: 0, visibility: 3, engagement: 7, prospects: 4, satisfaction: 9 }),
      c("crisis-response-b", "Supprimer le commentaire et contacter son auteur en privé pour éviter l’amplification", "La conversation disparaît momentanément, mais des captures circulent et la suppression devient le sujet principal.", "La modération peut être nécessaire, mais elle ne doit pas servir à dissimuler une critique légitime.", 3, { budget: 0, visibility: -3, engagement: -2, prospects: -2, satisfaction: -10 }),
      c("crisis-response-c", "Répondre avec la liste complète des résultats positifs et rappeler que l’auteur est minoritaire", "La réponse contient des chiffres, mais elle donne une impression de confrontation et ne répond pas au point sur la preuve.", "La preuve ne convainc pas lorsqu’elle est utilisée pour disqualifier la personne plutôt que pour éclairer la question.", 5, { budget: 0, visibility: 2, engagement: 0, prospects: 1, satisfaction: -4 }),
    ],
  },
  {
    id: "experiment", sequence: 12, title: "Phase 3 · Choisir l’expérience décisive",
    context: "Les résultats sont partagés : les demandes augmentent, mais le coût par prospect varie fortement selon le public. Vous pouvez conduire une seule expérience cette semaine avec un échantillon limité.",
    objective: "Quelle expérience réduit le mieux l’incertitude stratégique ?",
    imageKey: "analytics",
    choices: [
      c("experiment-a", "Tester une promesse différente sur deux segments comparables avec la même étape de conversion", "Vous identifiez la combinaison segment-promesse qui explique réellement l’écart de qualité.", "Un test utile isole une variable principale et protège les conditions de comparaison.", 10, { budget: -35000, visibility: 3, engagement: 8, prospects: 8, satisfaction: 6 }),
      c("experiment-b", "Changer simultanément le visuel, la promesse, le formulaire et le canal pour accélérer l’apprentissage", "Le résultat s’améliore peut-être, mais vous ne savez pas quelle modification a produit l’effet.", "Un changement global peut servir une refonte, pas un apprentissage causal avec une ressource limitée.", 5, { budget: -35000, visibility: 5, engagement: 4, prospects: 5, satisfaction: 2 }),
      c("experiment-c", "Répéter la campagne actuelle plus longtemps pour obtenir un volume statistique supérieur", "Le volume augmente, mais la même incertitude se prolonge et une dépense non optimale s’accumule.", "Attendre davantage n’est une stratégie que si le délai et le seuil d’apprentissage sont explicitement définis.", 6, { budget: -45000, visibility: 7, engagement: 2, prospects: 4, satisfaction: -1 }),
    ],
  },
  {
    id: "midpoint", sequence: 13, title: "Phase 4 · Décider avec des résultats incomplets",
    context: "À mi-parcours, le tableau indique : 68 000 impressions, 2 140 visites, 96 demandes, 31 rendez-vous et 12 inscriptions. Le coût par demande baisse, mais le taux de présence aux rendez-vous reste faible.",
    objective: "Quelle lecture doit guider la décision de la prochaine semaine ?",
    imageKey: "analytics",
    choices: [
      c("midpoint-a", "Conserver l’acquisition, traiter la présence comme un problème de confirmation et suivre la conversion par cohorte", "Vous évitez de couper une source utile et vous corrigez l’étape où la valeur se perd réellement.", "Lire le tunnel par étapes empêche de confondre un problème d’acquisition avec un problème d’activation.", 10, { budget: -50000, visibility: 5, engagement: 7, prospects: 9, satisfaction: 7 }),
      c("midpoint-b", "Couper le canal au meilleur coût par demande car son taux d’inscription finale est inférieur", "Le volume de demandes baisse et vous découvrez trop tard que ce canal alimentait les rendez-vous des semaines suivantes.", "La métrique la moins chère n’est pas forcément la plus proche de la valeur finale.", 5, { budget: 0, visibility: -5, engagement: -1, prospects: -2, satisfaction: -3 }),
      c("midpoint-c", "Augmenter tous les budgets proportionnellement pour profiter de la baisse du coût par demande", "Les demandes progressent, mais l’équipe ne peut pas confirmer les rendez-vous à temps.", "Un signal positif doit être confronté à la capacité opérationnelle avant d’être amplifié.", 6, { budget: -120000, visibility: 10, engagement: 1, prospects: 6, satisfaction: -4 }),
    ],
  },
  {
    id: "capacity", sequence: 14, title: "Phase 4 · Aligner acquisition et capacité",
    context: "La campagne performe mieux après les tests. Cependant, l’équipe ne peut accompagner que 20 nouveaux participants par mois sans dégrader la qualité. Le responsable commercial propose de continuer l’acquisition au même rythme pour ne pas perdre l’élan.",
    objective: "Quelle décision protège la promesse tout en conservant la demande ?",
    imageKey: "client",
    choices: [
      c("capacity-a", "Réguler les entrées par créneaux, expliciter le délai et maintenir une liste d’attente utile", "La demande reste active, les attentes sont claires et l’équipe peut tenir la qualité annoncée.", "La capacité fait partie de l’expérience : la cacher crée une dette de confiance plus coûteuse que l’attente organisée.", 10, { budget: -10000, visibility: 2, engagement: 6, prospects: 5, satisfaction: 10 }),
      c("capacity-b", "Continuer à collecter toutes les demandes et augmenter la promesse de disponibilité pour maintenir le taux de conversion", "Le taux de conversion immédiat reste bon, mais les retards de réponse provoquent des réclamations.", "Une promesse d’acquisition ne doit pas dépasser la capacité de délivrer l’expérience annoncée.", 3, { budget: -30000, visibility: 7, engagement: -3, prospects: 4, satisfaction: -10 }),
      c("capacity-c", "Arrêter toute communication jusqu’à ce que la capacité soit entièrement libérée", "La pression opérationnelle baisse, mais la marque perd le bénéfice de la dynamique et les prospects refroidissent.", "La régulation est souvent préférable à l’arrêt complet lorsque la demande peut être informée et séquencée.", 6, { budget: 0, visibility: -8, engagement: 1, prospects: -3, satisfaction: 2 }),
    ],
  },
  {
    id: "dashboard", sequence: 15, title: "Phase 4 · Présenter un tableau de pilotage",
    context: "La direction demande une synthèse pour décider du prochain budget. Elle ne veut pas une galerie de graphiques : elle veut savoir ce qui a fonctionné, ce qui reste incertain et ce qui doit changer.",
    objective: "Quelle structure de restitution permet une décision responsable ?",
    imageKey: "analytics",
    choices: [
      c("dashboard-a", "Relier chaque objectif à un indicateur, une cible, un écart, une hypothèse et une action proposée", "La direction peut arbitrer en connaissant les preuves, les limites de mesure et le coût de chaque option.", "Un tableau de bord devient décisionnel lorsqu’il relie observation, interprétation et action réversible.", 10, { budget: 0, visibility: 4, engagement: 6, prospects: 6, satisfaction: 8 }),
      c("dashboard-b", "Présenter surtout la portée et le nombre de contenus pour démontrer l’activité réalisée", "La production paraît importante, mais la direction ne sait pas si elle doit investir, corriger ou arrêter.", "L’activité explique l’effort ; elle ne démontre pas seule la progression vers l’objectif.", 4, { budget: 0, visibility: 6, engagement: 1, prospects: 0, satisfaction: -3 }),
      c("dashboard-c", "Présenter uniquement le meilleur scénario afin d’obtenir rapidement le budget suivant", "La décision est peut-être favorable, mais la confiance diminue dès que les limites et les résultats divergents apparaissent.", "Une recommandation crédible expose aussi les incertitudes et les conditions de réussite.", 5, { budget: 0, visibility: 5, engagement: 2, prospects: 2, satisfaction: -5 }),
    ],
  },
  {
    id: "final-recommendation", sequence: 16, title: "Phase 4 · Soutenir la recommandation finale",
    context: "Vous devez remettre une recommandation finale à Naya Conseil. Le budget prochain est de 600 000 FCFA. La direction hésite entre amplifier l’acquisition, renforcer les contenus de preuve ou améliorer le suivi des prospects.",
    objective: "Quelle recommandation finale synthétise le mieux les apprentissages de la mission ?",
    imageKey: "hero",
    choices: [
      c("final-recommendation-a", "Proposer un budget par étapes : capacité et suivi d’abord, amplification ensuite si les seuils de qualité sont tenus", "La recommandation protège l’expérience, conserve l’apprentissage et donne à la direction des conditions claires pour investir davantage.", "Une recommandation professionnelle articule objectif, capacité, preuve, risque, seuil de décision et prochaine mesure.", 10, { budget: -600000, visibility: 8, engagement: 8, prospects: 10, satisfaction: 10 }),
      c("final-recommendation-b", "Amplifier immédiatement le canal qui a produit le plus de demandes, avec une cible de volume mensuelle", "Le volume progresse rapidement, mais la capacité et la qualité du suivi deviennent le nouveau goulot d’étranglement.", "Une recommandation fondée sur le volume doit intégrer la capacité de conversion et de délivrance, sinon elle déplace le problème.", 5, { budget: -600000, visibility: 13, engagement: 1, prospects: 8, satisfaction: -5 }),
      c("final-recommendation-c", "Consacrer tout le budget à la production de contenus de preuve avant de reprendre l’acquisition", "La crédibilité progresse, mais l’organisation perd le rythme de collecte et ne sait pas si les nouvelles preuves changent la conversion.", "La preuve doit être reliée à une hypothèse et à un parcours de test, pas isolée du système d’acquisition.", 7, { budget: -600000, visibility: 2, engagement: 8, prospects: 3, satisfaction: 6 }),
    ],
  },
];
