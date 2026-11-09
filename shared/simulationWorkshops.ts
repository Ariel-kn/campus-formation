import type { Workshop, WorkDocument, WorkTask } from "./simulationWorkbench";

const doc = (
  title: string,
  columns: string[],
  rows: string[][]
): WorkDocument => ({ title, columns, rows });
const stableTokenOrder = (id: string, label: string, index: number): string => {
  let hash = 17 + index;
  for (const character of `${id}:${label}`)
    hash = (hash * 31 + character.charCodeAt(0)) % 100003;
  return `${String(hash).padStart(6, "0")}:${label}`;
};
const mixedTokens = (id: string, tokens: string[]) =>
  [...tokens]
    .map((label, index) => ({
      label,
      index,
      order: stableTokenOrder(id, label, index),
    }))
    .sort(
      (left, right) =>
        left.order.localeCompare(right.order) || left.index - right.index
    )
    .map(item => item.label)
    .map((label, index) => ({ id: `${id}-token-${index + 1}`, label }));
const placement = (
  id: string,
  title: string,
  instructions: string,
  slots: string[],
  tokens: string[]
): WorkTask => ({
  id,
  kind: "placement",
  title,
  instructions,
  slots: slots.map(label => ({
    id: `${id}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
  })),
  tokens: mixedTokens(id, tokens),
});
const cloze = (
  id: string,
  title: string,
  instructions: string,
  slots: string[],
  tokens: string[],
  passage: string
): WorkTask => ({
  id,
  kind: "cloze",
  title,
  instructions,
  slots: slots.map(label => ({
    id: `${id}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
  })),
  tokens: mixedTokens(id, tokens),
  passage: passage.replace(
    /\{slot-([a-z])\}/g,
    (_, slot: string) => `{${id}-${slot}}`
  ),
});
const ordering = (
  id: string,
  title: string,
  instructions: string,
  slots: string[],
  tokens: string[]
): WorkTask => ({
  id,
  kind: "ordering",
  title,
  instructions,
  slots: slots.map((label, index) => ({
    id: `${id}-step-${index + 1}`,
    label,
  })),
  tokens: mixedTokens(id, tokens),
});
const numeric = (
  id: string,
  title: string,
  instructions: string,
  fields: [string, string, string][],
  kind: "numeric" | "budget" = "numeric",
  total?: number
): WorkTask => ({
  id,
  kind,
  title,
  instructions,
  fields: fields.map(([fieldId, label, unit]) => ({
    id: `${id}-${fieldId}`,
    label,
    unit,
  })),
  ...(total === undefined ? {} : { total }),
});
const writing = (
  id: string,
  title: string,
  instructions: string,
  fields: [string, string, number, string?][]
): WorkTask => ({
  id,
  kind: "writing",
  title,
  instructions,
  fields: fields.map(([fieldId, label, minWords, placeholder]) => ({
    id: `${id}-${fieldId}`,
    label,
    minWords,
    ...(placeholder ? { placeholder } : {}),
  })),
});
const dialogue = (
  id: string,
  title: string,
  instructions: string,
  character: string,
  role: string,
  turns: [string, string, number, string[], string, string][]
): WorkTask => ({
  id,
  kind: "dialogue",
  title,
  instructions,
  character,
  role,
  turns: turns.map(([turnId, message, minWords, cues, aligned, fallback]) => ({
    id: `${id}-${turnId}`,
    message,
    minWords,
    cues,
    aligned,
    fallback,
  })),
});

const detailedWorkshops: Workshop[] = [
  {
    id: "atelier-01-diagnostic",
    sequence: 1,
    title: "Diagnostic de présence et objectif mesurable",
    minutes: 8,
    brief:
      "Naya Conseil prépare une campagne de sensibilisation pour des responsables de petites équipes. À partir de données incomplètes, formulez un diagnostic prudent et choisissez l’objectif qui permettra de comparer les prochaines actions.",
    documents: [
      doc(
        "Relevé des quatre dernières semaines",
        ["Canal", "Portée", "Visites", "Demandes", "Observation"],
        [
          [
            "LinkedIn",
            "18 000",
            "540",
            "27",
            "Commentaires détaillés, peu de volume",
          ],
          [
            "Instagram",
            "31 000",
            "930",
            "18",
            "Portée élevée, intention inconnue",
          ],
          [
            "Newsletter",
            "1 800",
            "216",
            "21",
            "Audience connue mais peu segmentée",
          ],
          ["Direct", "—", "—", "12", "Demandes issues de recommandations"],
        ]
      ),
      doc(
        "Contraintes de décision",
        ["Élément", "Valeur"],
        [
          ["Capacité de suivi", "25 conversations par jour"],
          ["Période de comparaison", "14 jours"],
          ["Budget test", "120 000 FCFA"],
          ["Priorité déclarée", "qualité des demandes, pas la portée seule"],
        ]
      ),
    ],
    tasks: [
      placement(
        "diag-axes",
        "Relier douze situations à leur levier ou mesure",
        "Placez les cartes adaptées aux douze situations. Douze propositions ne seront pas utilisées : distinguez métrique, risque, action et règle de décision.",
        [
          "Comparaison du trafic entre canaux",
          "Risque d’interprétation de la portée Instagram",
          "Limite du relevé Direct",
          "Organisation du test sur la période fixée",
          "Mesure du passage visite vers demande",
          "Mesure du passage impression vers visite",
          "Limite quotidienne de charge de suivi",
          "Contrôle de l’attribution des recommandations",
          "Analyse des commentaires détaillés",
          "Critère de segmentation des responsables d’équipe",
          "Réparation d’un formulaire abandonné car trop long",
          "Contrôle avant d’amplifier les demandes",
        ],
        [
          "Comparer les visites qualifiées",
          "Ne pas confondre portée et demande",
          "Documenter la source manquante",
          "Répartir le test sur 14 jours",
          "Taux de demandes par visite",
          "Taux de visites par impression",
          "Capacité quotidienne de conversations",
          "Traçage du canal d’origine",
          "Analyse des questions formulées",
          "Besoin d’une méthode commune",
          "Réduction des champs nécessaires",
          "Délai moyen de première réponse",
          "Taux de clic sur un lien de newsletter",
          "Coût pour mille impressions",
          "Nombre total d’abonnés",
          "Fréquence moyenne d’exposition",
          "Portée unique par plateforme",
          "Score de recommandation NPS",
          "Taux de confirmation des rendez-vous",
          "Taux de désabonnement à trente jours",
          "Taux de partage des publications",
          "Durée moyenne de lecture",
          "Taux de réponse aux relances",
          "Coût par inscription",
        ]
      ),
      numeric(
        "diag-calcul",
        "Calculer trois ratios et une capacité",
        "Utilisez les données du tableau. Arrondissez le taux à deux décimales et le ratio à une décimale.",
        [
          ["visites-total", "Total des visites chiffrées", "visites"],
          ["demandes-total", "Total des demandes", "demandes"],
          ["taux-demande", "Demandes / visites × 100", "%"],
          [
            "jours-capacite",
            "Conversations possibles sur 14 jours",
            "conversations",
          ],
        ]
      ),
      writing(
        "diag-ecrit",
        "Rédiger le diagnostic",
        "Écrivez une recommandation opérationnelle qui distingue un fait, une hypothèse, une limite de mesure et la prochaine vérification. La qualité de l’argumentation est corrigée manuellement.",
        [
          [
            "diagnostic",
            "Diagnostic en quatre phrases",
            40,
            "Faits, hypothèse, limite, vérification",
          ],
          [
            "objectif",
            "Objectif de campagne et indicateur associé",
            40,
            "Un objectif observable et son indicateur",
          ],
        ]
      ),
    ],
    rubric: [
      "Faits séparés des hypothèses et limites",
      "Calculs cohérents avec le relevé",
      "Objectif observable et méthode de vérification",
      "Écrit évalué sur la pertinence, jamais sur sa longueur ou des mots-clés",
    ],
  },
  {
    id: "atelier-02-audience",
    sequence: 2,
    title: "Segmenter sans fabriquer de persona",
    minutes: 7,
    brief:
      "Deux publics apparaissent dans les entretiens : responsables d’équipe et jeunes actifs en progression. Construisez une segmentation utilisable pour choisir une promesse sans exclure trop tôt les personnes encore en exploration.",
    documents: [
      doc(
        "Extraits d’entretiens",
        ["Profil", "Situation", "Besoin exprimé", "Frein"],
        [
          [
            "Responsable d’équipe",
            "6 personnes à accompagner",
            "une méthode applicable en réunion",
            "manque de temps",
          ],
          [
            "Jeune actif",
            "évolution de poste",
            "progresser avec un plan",
            "peur de choisir une mauvaise priorité",
          ],
          [
            "Explorateur",
            "information générale",
            "comprendre les options",
            "ne sait pas encore quand agir",
          ],
        ]
      ),
    ],
    tasks: [
      cloze(
        "audience-cloze",
        "Compléter la logique de segmentation",
        "Choisissez une carte par case. Les cartes inutilisées sont des distracteurs : elles ne doivent pas être forcées dans le passage.",
        ["a", "b", "c", "d", "e", "f", "g", "h"],
        [
          "besoin",
          "contexte",
          "preuve",
          "priorite",
          "hypothese",
          "critere",
          "ressource",
          "prochaine",
          "volume",
          "age",
          "viralite",
          "intuition",
          "promesse",
          "canal",
          "prix",
          "logo",
          "hasard",
          "score",
          "statut",
          "segment",
          "format",
          "emotion",
          "confiance",
          "delai",
        ],
        "Une segmentation utile part du {slot-a}, décrit le {slot-b}, formule une {slot-c}, fixe une {slot-d}, explicite l’{slot-e}, retient un {slot-f}, propose une {slot-g} et définit la {slot-h} vérification."
      ),
      writing(
        "audience-ecrit",
        "Construire une fiche de décision",
        "Décrivez les deux segments prioritaires, ce qui les rapproche, ce qui les distingue et le signal qui ferait changer l’ordre de priorité.",
        [
          [
            "segments",
            "Fiche comparative des deux segments",
            40,
            "Critères communs et différences",
          ],
          [
            "bascule",
            "Règle de bascule documentée",
            40,
            "Quel signal ferait évoluer le choix ?",
          ],
        ]
      ),
    ],
    rubric: [
      "Segmentation fondée sur situation et besoin",
      "Critère de bascule observable",
      "Prudence face aux inférences non démontrées",
      "Correction manuelle de la rédaction sans notation de longueur",
    ],
  },
  {
    id: "atelier-03-parcours",
    sequence: 3,
    title: "Ordonner un parcours de découverte",
    minutes: 6,
    brief:
      "Les personnes découvrent Naya par plusieurs canaux. Ordonnez une séquence qui réduit l’effort, garde une trace utile et ne transforme pas immédiatement une demande exploratoire en rendez-vous forcé.",
    documents: [
      doc(
        "Signaux observés",
        ["Étape", "Donnée", "Problème"],
        [
          ["Découverte", "42 000 impressions", "promesse peu mémorisée"],
          ["Visite", "8,6 % des clics", "pages d’arrivée hétérogènes"],
          ["Demande", "61 formulaires", "trop de champs obligatoires"],
          ["Suivi", "34 réponses", "aucun choix de rythme"],
        ]
      ),
    ],
    tasks: [
      ordering(
        "parcours-ordre",
        "Ordonner la conception du parcours",
        "Placez les cartes dans l’ordre de travail. Trois cartes sont des distracteurs de méthode.",
        [
          "étape-1",
          "étape-2",
          "étape-3",
          "étape-4",
          "étape-5",
          "étape-6",
          "étape-7",
        ],
        [
          "Observer les abandons",
          "Nommer l’intention principale",
          "Réduire les champs nécessaires",
          "Proposer une ressource adaptée",
          "Donner deux chemins de suite",
          "Mesurer la réponse par cohorte",
          "Prévoir une sortie simple",
          "Ajouter tous les champs disponibles",
          "Envoyer tout le monde en rendez-vous",
          "Changer le logo d’abord",
        ]
      ),
      writing(
        "parcours-ecrit",
        "Justifier le parcours",
        "Expliquez les arbitrages de friction, de consentement et de capacité de suivi. Donnez un risque et son contrôle.",
        [
          [
            "justification",
            "Justification du parcours",
            35,
            "Pourquoi cet ordre ?",
          ],
          [
            "controle",
            "Contrôle de capacité et de consentement",
            35,
            "Comment éviter la pression inutile ?",
          ],
        ]
      ),
    ],
    rubric: [
      "Ordre guidé par les signaux du parcours",
      "Friction réduite sans automatisation aveugle",
      "Contrôle de capacité et de consentement",
      "Rédaction appréciée manuellement sur la qualité du raisonnement",
    ],
  },
  {
    id: "atelier-04-budget",
    sequence: 4,
    title: "Arbitrer un budget de campagne",
    minutes: 6,
    brief:
      "La direction libère 600 000 FCFA pour un test de 21 jours. Répartissez exactement cette enveloppe entre six postes, puis justifiez les arbitrages et les seuils qui déclencheraient une réallocation.",
    documents: [
      doc(
        "Postes possibles",
        ["Poste", "Rôle", "Risque si sous-financé"],
        [
          ["Production", "formats et adaptation", "message peu testable"],
          ["Diffusion", "atteindre les segments", "échantillon trop petit"],
          ["Mesure", "marquage et tableau", "décision à l’aveugle"],
          ["Relation", "réponses et relances utiles", "demandes perdues"],
          ["Accessibilité", "formats lisibles et sous-titres", "public exclu"],
          [
            "Réserve",
            "correction après observation",
            "aucune marge d’apprentissage",
          ],
        ]
      ),
      doc(
        "Seuils proposés",
        ["Indicateur", "Seuil d’alerte", "Action possible"],
        [
          ["Taux de demande", "< 3 % des visites", "réviser la promesse"],
          [
            "Délai de réponse",
            "> 24 h",
            "réduire le flux ou renforcer la relation",
          ],
          ["Taux de présence", "< 60 %", "tester confirmation et créneau"],
          ["Satisfaction", "< 70/100", "écouter les objections"],
        ]
      ),
    ],
    tasks: [
      numeric(
        "budget-postes",
        "Répartir les six postes",
        "Saisissez un montant entier en FCFA pour chaque poste. La somme doit être exactement de 600 000 FCFA et aucune ligne ne peut être négative.",
        [
          ["production", "Production", "FCFA"],
          ["diffusion", "Diffusion", "FCFA"],
          ["mesure", "Mesure", "FCFA"],
          ["relation", "Relation", "FCFA"],
          ["accessibilite", "Accessibilité", "FCFA"],
          ["reserve", "Réserve d’apprentissage", "FCFA"],
        ],
        "budget",
        600000
      ),
      numeric(
        "budget-calcul",
        "Contrôler le plan",
        "À partir de votre propre répartition, calculez le sous-total des quatre premiers postes et le montant d’une des deux vagues identiques de diffusion. Saisissez aussi les deux seuils de décision repris du tableau.",
        [
          [
            "sous-total",
            "Sous-total production + diffusion + mesure + relation",
            "FCFA",
          ],
          [
            "vague",
            "Montant d’une vague si la diffusion est séparée en deux",
            "FCFA",
          ],
          ["seuil-demande", "Seuil de demande à surveiller", "%"],
          ["seuil-delai", "Délai d’alerte", "heures"],
        ]
      ),
      writing(
        "budget-justification",
        "Défendre l’arbitrage",
        "Expliquez pourquoi les six postes ont chacun une fonction, comment la réserve sera libérée et quelle décision sera prise si un seuil se dégrade.",
        [
          [
            "justification",
            "Note d’arbitrage budgétaire",
            90,
            "Raisonnement, seuils et réallocation",
          ],
        ]
      ),
    ],
    rubric: [
      "Somme exacte et postes cohérents",
      "Arbitrage relié aux risques mesurés",
      "Réserve conditionnelle plutôt qu’un reliquat opaque",
      "Note corrigée manuellement sans prime à la longueur",
    ],
  },
  {
    id: "atelier-05-editorial",
    sequence: 5,
    title: "Construire un tableau éditorial utile",
    minutes: 9,
    brief:
      "Transformez les observations du parcours en six lignes éditoriales complémentaires. Chaque ligne doit avoir un canal, un objectif, un angle, une preuve ou donnée, un appel à l’action et un indicateur.",
    documents: [
      doc(
        "Matière éditoriale disponible",
        ["Élément", "Donnée ou preuve", "Précaution"],
        [
          [
            "Atelier pilote",
            "18 participants, 14 retours exploitables",
            "ne pas généraliser",
          ],
          [
            "Objection prix",
            "23 demandes demandent le détail du parcours",
            "expliquer la valeur",
          ],
          [
            "Objection temps",
            "17 personnes citent moins de 30 minutes",
            "proposer une première étape",
          ],
          [
            "Question méthode",
            "31 commentaires demandent un exemple",
            "montrer le contexte",
          ],
          [
            "Question confiance",
            "9 demandes veulent un référent identifiable",
            "rendre la relation visible",
          ],
          [
            "Signal de suivi",
            "les relances choisies obtiennent 42 % de réponse",
            "laisser le choix de rythme",
          ],
        ]
      ),
    ],
    tasks: [
      writing(
        "editorial-tableau",
        "Remplir six lignes éditoriales",
        "Rédigez six lignes distinctes. Pour chaque ligne, indiquez explicitement canal, objectif, angle, preuve ou donnée, CTA et indicateur. Une ligne = un paragraphe clairement séparé.",
        [
          [
            "ligne-1",
            "Ligne 1 : découverte",
            15,
            "Canal ; objectif ; angle ; preuve ; CTA ; indicateur",
          ],
          [
            "ligne-2",
            "Ligne 2 : objection temps",
            15,
            "Canal ; objectif ; angle ; preuve ; CTA ; indicateur",
          ],
          [
            "ligne-3",
            "Ligne 3 : objection valeur",
            15,
            "Canal ; objectif ; angle ; preuve ; CTA ; indicateur",
          ],
          [
            "ligne-4",
            "Ligne 4 : méthode",
            15,
            "Canal ; objectif ; angle ; preuve ; CTA ; indicateur",
          ],
          [
            "ligne-5",
            "Ligne 5 : confiance",
            15,
            "Canal ; objectif ; angle ; preuve ; CTA ; indicateur",
          ],
          [
            "ligne-6",
            "Ligne 6 : suivi",
            15,
            "Canal ; objectif ; angle ; preuve ; CTA ; indicateur",
          ],
        ]
      ),
      placement(
        "editorial-funnel",
        "Relier les rôles éditoriaux",
        "Associez chaque rôle à la fonction qu’il remplit dans le parcours.",
        ["attention", "comprehension", "preuve", "objection"],
        [
          "Faire remarquer un problème",
          "Rendre la méthode concrète",
          "Donner un élément vérifiable",
          "Réduire une hésitation",
          "Obtenir le plus de vues",
          "Répliquer le format viral",
        ]
      ),
    ],
    rubric: [
      "Six lignes distinctes et actionnables",
      "Objectif, angle et CTA non confondus",
      "Indicateur compatible avec le rôle du canal",
      "Évaluation manuelle de la pertinence, pas des mots-clés",
    ],
  },
  {
    id: "atelier-06-ab",
    sequence: 6,
    title: "Analyser un test A/B sans surinterpréter",
    minutes: 8,
    brief:
      "Deux accroches ont été testées sur deux segments comparables pendant sept jours. Calculez les indicateurs, repérez les limites de l’inférence et proposez une réparation du protocole.",
    documents: [
      doc(
        "Résultats bruts du test",
        ["Variante", "Expositions", "Clics", "Demandes", "Désistements"],
        [
          ["A · méthode", "10 000", "620", "31", "4"],
          ["B · résultat", "10 000", "700", "28", "9"],
        ]
      ),
      doc(
        "Conditions",
        ["Élément", "Valeur"],
        [
          ["Durée", "7 jours"],
          ["Répartition", "50/50 annoncée"],
          [
            "Changement simultané",
            "visuel différent et heure de diffusion différente",
          ],
          ["Événement principal", "demande complète"],
          ["Échantillon", "un seul segment prioritaire"],
        ]
      ),
    ],
    tasks: [
      numeric(
        "ab-calcul",
        "Calculer les indicateurs A/B",
        "Calculez les taux de clic, de demande parmi les clics, les demandes nettes et l’écart de demandes entre les variantes. Arrondissez les pourcentages à deux décimales.",
        [
          ["ctr-a", "CTR variante A", "%"],
          ["ctr-b", "CTR variante B", "%"],
          ["taux-demande-a", "Demandes / clics A", "%"],
          ["net-b", "Demandes B moins désistements B", "demandes"],
        ]
      ),
      writing(
        "ab-analyse",
        "Rédiger l’analyse et la réparation",
        "Discutez de ce que le test permet ou non de conclure. Proposez une réparation isolant une variable, un événement principal, une durée ou un seuil d’arrêt et une limite qui resterait.",
        [
          [
            "limites",
            "Limites de l’inférence",
            35,
            "Ce que les données ne prouvent pas",
          ],
          [
            "reparation",
            "Protocole réparé",
            35,
            "Variable, mesure et décision",
          ],
          [
            "decision",
            "Décision provisoire",
            30,
            "Ce qui est fait maintenant et pourquoi",
          ],
        ]
      ),
    ],
    rubric: [
      "Calculs exacts",
      "Confusion visuel/heure identifiée",
      "Décision proportionnée à l’incertitude",
      "Réparation concrète et limite restante, corrigées manuellement",
    ],
  },
  {
    id: "atelier-07-conversation",
    sequence: 7,
    title: "Conduire une conversation de qualification",
    minutes: 10,
    brief:
      "Une responsable d’équipe demande si l’accompagnement peut convenir à six personnes sans alourdir leur agenda. Conduisez un échange de quatre tours : écouter le problème, reformuler, traiter une objection et convenir d’une prochaine étape réaliste.",
    documents: [
      doc(
        "Fiche de contexte",
        ["Élément", "Information"],
        [
          ["Personne", "Awa, responsable d’une équipe de six"],
          ["Contrainte", "réunion hebdomadaire de 45 minutes"],
          ["Besoin", "faire émerger une méthode commune"],
          ["Doute", "crainte d’une promesse trop générale"],
          [
            "Prochaine étape possible",
            "un échange de 20 minutes avec un exemple",
          ],
        ]
      ),
    ],
    tasks: [
      dialogue(
        "qualification-dialogue",
        "Écrire les quatre réponses",
        "Répondez au personnage sans inventer de preuve. Chaque tour doit poursuivre la conversation et rester aligné sur le contexte fourni. Les réactions sont scénarisées ; elles ne constituent pas une évaluation IA.",
        "Awa, responsable d’équipe",
        "Vous êtes conseiller de Naya Conseil.",
        [
          [
            "tour-1",
            "Awa : « J’ai six personnes et très peu de temps. Je ne veux pas d’un programme qui reste théorique. »",
            25,
            ["temps", "theorique", "six", "équipe"],
            "Vous avez identifié la contrainte de temps et le besoin d’application ; demandez un exemple de situation à traiter.",
            "Vous reconnaissez la contrainte et posez une question concrète pour éviter de répondre à côté.",
          ],
          [
            "tour-2",
            "Awa : « Nous avons surtout besoin d’une méthode commune, mais chaque personne part d’un niveau différent. »",
            25,
            ["méthode", "niveau", "différent", "commun"],
            "Vous reformulez le besoin commun et proposez une progression qui laisse une trace utilisable par chacun.",
            "Vous poursuivez en demandant ce qui devrait être commun et ce qui peut rester différencié.",
          ],
          [
            "tour-3",
            "Awa : « J’ai peur que la promesse soit trop générale pour justifier le temps de l’équipe. »",
            25,
            ["peur", "générale", "promesse", "temps"],
            "Vous accueillez l’objection, distinguez bénéfice observable et garantie, puis annoncez ce qui peut être vérifié.",
            "Vous ne contournez pas l’objection : vous demandez quel résultat observable rendrait l’essai utile.",
          ],
          [
            "tour-4",
            "Awa : « D’accord, mais je ne peux pas engager tout le groupe maintenant. »",
            25,
            ["engager", "groupe", "maintenant", "vingt", "20"],
            "Vous proposez l’échange de 20 minutes avec un exemple, un critère de décision et une possibilité de ne pas poursuivre.",
            "Vous proposez une étape légère et réversible plutôt que de pousser vers un engagement immédiat.",
          ],
        ]
      ),
      writing(
        "qualification-synthese",
        "Synthétiser la qualification",
        "Rédigez la fiche que vous transmettez à l’équipe : problème, preuve à demander, prochaine étape et limite de ce qui peut être promis.",
        [
          [
            "synthese",
            "Synthèse de qualification",
            50,
            "Contexte, besoin, prochaine étape, limite",
          ],
          [
            "suivi",
            "Message de suivi à Awa",
            50,
            "Message bref et transparent",
          ],
        ]
      ),
    ],
    rubric: [
      "Écoute et reformulation",
      "Objection traitée sans garantie infondée",
      "Étape réversible et critère de décision",
      "Chaque réponse est appréciée manuellement sur sa qualité, pas sa longueur",
    ],
  },
  {
    id: "atelier-08-adaptation",
    sequence: 8,
    title: "Adapter le pilotage à la branche observée",
    minutes: 8,
    brief:
      "Les sept premiers ateliers donnent un signal de pilotage. Selon les résultats, vous recevez un tableau de situation forte ou fragile. Les valeurs restent calculables : adaptez vos calculs et votre recommandation sans bloquer le parcours.",
    documents: [
      doc(
        "Tableau de situation initiale",
        ["Indicateur", "Valeur", "Définition"],
        [
          ["Visites", "1200", "visites suivies"],
          ["Demandes", "72", "formulaires complets"],
          ["Budget engagé", "120000", "FCFA"],
          ["Délai moyen", "31", "heures"],
          ["Réponses au suivi", "48", "contacts"],
          ["Satisfaction", "61", "sur 100"],
        ]
      ),
      doc(
        "Règle d’adaptation",
        ["Signal", "Orientation"],
        [
          ["Résultats forts", "protéger la qualité puis amplifier par vagues"],
          ["Résultats fragiles", "réparer le parcours avant d’amplifier"],
          ["Dans les deux cas", "indiquer une mesure de contrôle et un seuil"],
        ]
      ),
    ],
    tasks: [
      numeric(
        "adaptation-calcul",
        "Lire le tableau adapté",
        "Calculez le taux de demande, le coût par demande, le délai restant avant 48 heures et le taux de réponse au suivi. Pourcentages à deux décimales.",
        [
          ["taux-demande", "Demandes / visites × 100", "%"],
          ["cout-demande", "Budget engagé / demandes", "FCFA"],
          ["delai-marge", "Marge avant 48 heures", "heures"],
          ["taux-reponse", "Réponses / demandes × 100", "%"],
        ]
      ),
      placement(
        "adaptation-decision",
        "Choisir l’ordre de pilotage",
        "Placez les décisions dans la séquence qui protège la qualité dans la branche reçue.",
        ["observer", "reparer", "amplifier", "controler"],
        [
          "Lire le taux et la capacité",
          "Corriger le point faible prioritaire",
          "Libérer une nouvelle vague",
          "Vérifier le seuil après la vague",
          "Multiplier la diffusion sans seuil",
          "Masquer les demandes lentes",
        ]
      ),
      writing(
        "adaptation-note",
        "Formuler la recommandation branchée",
        "Expliquez ce que vous faites maintenant selon les chiffres reçus, ce que vous refusez de conclure et le signal qui autoriserait l’étape suivante.",
        [["note", "Note de pilotage adaptée", 60, "Action, prudence et seuil"]]
      ),
    ],
    rubric: [
      "Calculs dérivés des données affichées",
      "Branche forte ou fragile explicitement reconnue",
      "Amplification conditionnelle",
      "Recommandation corrigée manuellement sur le raisonnement",
    ],
  },
  {
    id: "atelier-09-crise",
    sequence: 9,
    title: "Gérer une critique publique",
    minutes: 7,
    brief:
      "Un commentaire public affirme que le programme est trop général et qu’un témoignage est exagéré. Répondez en quatre tours, vérifiez les faits et rendez la correction visible sans supprimer une critique légitime.",
    documents: [
      doc(
        "Dossier de crise",
        ["Élément", "État vérifié"],
        [
          ["Témoignage", "résultat réel mais formulation trop absolue"],
          ["Commentaire", "visible depuis 35 minutes, partagé 14 fois"],
          [
            "Réponse disponible",
            "un exemple contextualisé et le protocole de collecte",
          ],
          ["Délai", "réponse publique dans l’heure"],
          ["Règle", "ne pas divulguer d’information personnelle"],
        ]
      ),
    ],
    tasks: [
      dialogue(
        "crise-dialogue",
        "Répondre en quatre tours",
        "Rédigez une réponse publique puis sa suite. Reconnaissez ce qui est exact, distinguez opinion et fait, proposez une correction accessible et offrez une poursuite transparente. Aucun tour ne doit clore artificiellement l’échange.",
        "Moussa, auteur du commentaire",
        "Vous êtes responsable de la communication de Naya Conseil.",
        [
          [
            "tour-1",
            "Moussa : « Votre programme est trop général et le témoignage semble exagéré. »",
            25,
            ["général", "exagéré", "témoignage", "semble"],
            "Vous reconnaissez que la formulation était trop absolue et annoncez une vérification publique du témoignage.",
            "Vous demandez quel élément précis paraît général ou exagéré afin de traiter le fond.",
          ],
          [
            "tour-2",
            "Moussa : « Vous dites donc que votre publication était imprécise ? »",
            25,
            ["imprécise", "publication", "dites", "donc"],
            "Vous confirmez la limite de formulation, séparez le résultat réellement documenté de la promesse excessive et indiquez la correction.",
            "Vous poursuivez en distinguant ce qui est vérifié de ce qui doit encore être établi.",
          ],
          [
            "tour-3",
            "Moussa : « Pourquoi ne pas supprimer le commentaire au lieu d’entretenir la polémique ? »",
            25,
            ["supprimer", "polémique", "commentaire"],
            "Vous expliquez que la critique reste recevable, rappelez la règle de modération et proposez de publier la précision pour tous.",
            "Vous répondez sur la règle de modération et demandez quel format de précision serait le plus utile.",
          ],
          [
            "tour-4",
            "Moussa : « Je veux voir la preuve, pas une promesse de plus. »",
            25,
            ["preuve", "promesse", "voir"],
            "Vous fournissez l’exemple contextualisé sans donnée personnelle, donnez la limite de l’échantillon et invitez à poursuivre la vérification.",
            "Vous rendez la vérification concrète et laissez ouverte la poursuite de l’échange sur les faits.",
          ],
        ]
      ),
      writing(
        "crise-plan",
        "Préparer le suivi de crise",
        "Rédigez la fiche interne : faits vérifiés, correction à publier, responsable, délai et critère de clôture. Distinguez la réparation de la suppression.",
        [
          [
            "plan",
            "Plan de réponse interne",
            50,
            "Faits, action, responsable, délai",
          ],
          [
            "publication",
            "Précision publique",
            50,
            "Correction lisible et contextualisée",
          ],
        ]
      ),
    ],
    rubric: [
      "Reconnaissance précise sans aveu fabriqué",
      "Correction rendue visible",
      "Critique légitime distinguée d’un abus",
      "Dialogue et écrits évalués manuellement sans mesure de longueur",
    ],
  },
  {
    id: "atelier-10-operations",
    sequence: 10,
    title: "Organiser une boucle de suivi",
    minutes: 7,
    brief:
      "Les demandes arrivent à des rythmes différents et l’équipe ne peut répondre à tout le monde de la même manière. Complétez la boucle de suivi puis ordonnez un traitement qui respecte le consentement et la capacité.",
    documents: [
      doc(
        "Tableau de suivi",
        ["Segment de demande", "Volume", "Délai attendu", "Signal"],
        [
          ["Urgente", "18", "24 h", "équipe à réunir"],
          ["Exploratoire", "40", "72 h", "besoin de comprendre"],
          ["À revoir", "16", "7 jours", "a demandé une ressource"],
          ["Sans réponse", "22", "choix de rythme", "consentement maintenu"],
        ]
      ),
    ],
    tasks: [
      ordering(
        "operations-ordre",
        "Ordonner la boucle de suivi",
        "Placez les étapes dans l’ordre d’une boucle responsable ; les cartes parasites ne doivent pas être utilisées.",
        ["etape-1", "etape-2", "etape-3", "etape-4", "etape-5", "etape-6"],
        [
          "Vérifier le consentement",
          "Classer par besoin et délai",
          "Envoyer une réponse contextualisée",
          "Proposer une ressource utile",
          "Laisser choisir le rythme",
          "Mesurer la réponse par segment",
          "Relancer sans limite",
          "Copier toute la base",
          "Promettre une disponibilité immédiate",
        ]
      ),
      cloze(
        "operations-cloze",
        "Compléter la règle de relation",
        "Choisissez une carte par case pour compléter une règle de suivi applicable.",
        ["a", "b", "c", "d", "e", "f", "g", "h"],
        [
          "consentement",
          "contexte",
          "délai",
          "ressource",
          "choix",
          "mesure",
          "sortie",
          "capacité",
          "pression",
          "volume",
          "oubli",
          "automatique",
          "logo",
          "promesse",
          "prix",
          "hasard",
          "réponse",
          "segment",
          "preuve",
          "pause",
          "rythme",
          "public",
          "statut",
          "alerte",
        ],
        "Une relation utile vérifie le {slot-a}, conserve le {slot-b}, annonce un {slot-c}, joint une {slot-d}, laisse un {slot-e}, suit une {slot-f}, offre une {slot-g} et respecte la {slot-h} de l’équipe."
      ),
      writing(
        "operations-note",
        "Écrire la règle à l’équipe",
        "Rédigez une règle courte de traitement et un exemple de message de suivi qui reste utile même si la personne ne répond pas.",
        [
          ["regle", "Règle de traitement", 40, "Priorité, délai, consentement"],
          ["message", "Exemple de message", 40, "Valeur et choix de rythme"],
        ]
      ),
    ],
    rubric: [
      "Priorité fondée sur besoin et délai",
      "Consentement et sortie explicites",
      "Règle compatible avec la capacité",
      "Écrits corrigés manuellement sur leur qualité",
    ],
  },
  {
    id: "atelier-11-diagnostic-final",
    sequence: 11,
    title: "Diagnostiquer un tableau de pilotage",
    minutes: 7,
    brief:
      "La direction veut savoir si le dispositif progresse réellement. Lisez le tableau complet, calculez les ratios demandés et rédigez un diagnostic qui distingue acquisition, activation, qualité et capacité.",
    documents: [
      doc(
        "Tableau de pilotage à mi-parcours",
        ["Indicateur", "Valeur"],
        [
          ["Impressions", "68000"],
          ["Visites", "2140"],
          ["Demandes", "96"],
          ["Rendez-vous", "31"],
          ["Présences", "19"],
          ["Inscriptions", "12"],
          ["Budget engagé", "420000"],
          ["Réponses de suivi", "43"],
        ]
      ),
      doc(
        "Seuils de lecture",
        ["Indicateur", "Repère"],
        [
          ["Taux visite", "à calculer"],
          ["Taux demande", "à calculer"],
          ["Présence / rendez-vous", "au moins 60 %"],
          ["Inscription / demande", "à suivre par cohorte"],
          ["Capacité mensuelle", "20 participants"],
        ]
      ),
    ],
    tasks: [
      numeric(
        "diagnostic-final-calcul",
        "Calculer huit repères",
        "Saisissez les huit valeurs calculées à partir du tableau. Pourcentages à deux décimales ; coût et ratios monétaires à deux décimales.",
        [
          ["taux-visite", "Visites / impressions × 100", "%"],
          ["taux-demande", "Demandes / visites × 100", "%"],
          ["taux-rdv", "Rendez-vous / demandes × 100", "%"],
          ["taux-presence", "Présences / rendez-vous × 100", "%"],
          ["taux-inscription", "Inscriptions / demandes × 100", "%"],
          ["cout-demande", "Budget / demandes", "FCFA"],
          ["cout-inscription", "Budget / inscriptions", "FCFA"],
          [
            "marge-capacite",
            "Capacité restante : 20 moins les inscriptions affichées",
            "places",
          ],
        ]
      ),
      writing(
        "diagnostic-final-note",
        "Rédiger le diagnostic de direction",
        "Rédigez une note qui répond à trois questions : où le parcours perd-il de la valeur, quelle donnée manque pour conclure, quelle action réversible recommandez-vous la semaine prochaine ?",
        [
          [
            "diagnostic",
            "Diagnostic structuré",
            45,
            "Acquisition, activation, qualité, capacité",
          ],
          [
            "recommendation",
            "Recommandation réversible",
            45,
            "Action, preuve attendue, seuil",
          ],
        ]
      ),
    ],
    rubric: [
      "Huit calculs exacts",
      "Pertes du parcours localisées",
      "Donnée manquante explicitée",
      "Recommandation reliée à un seuil et corrigée manuellement",
    ],
  },
  {
    id: "atelier-12-note-finale",
    sequence: 12,
    title: "Soutenir une note finale de décision",
    minutes: 7,
    brief:
      "Présentez une recommandation finale à Naya Conseil. Elle doit protéger la qualité de l’expérience, proposer une amplification conditionnelle et rendre visibles les limites de mesure au lieu de promettre un résultat certain.",
    documents: [
      doc(
        "Décisions possibles",
        ["Option", "Gain espéré", "Risque", "Condition"],
        [
          [
            "Amplifier",
            "plus de visites et demandes",
            "capacité dépassée",
            "seuil de délai tenu",
          ],
          [
            "Renforcer la preuve",
            "confiance et compréhension",
            "apprentissage plus lent",
            "preuve contextualisée",
          ],
          [
            "Réparer le suivi",
            "meilleure activation",
            "volume temporairement limité",
            "règle de réponse adoptée",
          ],
        ]
      ),
      doc(
        "Bilan de mission",
        ["Constat", "Niveau de confiance"],
        [
          ["La portée augmente", "élevé"],
          ["La qualité des demandes progresse", "moyen"],
          ["L’attribution entre canaux", "faible"],
          ["La capacité de réponse", "à surveiller"],
          ["Le témoignage", "corrigé et contextualisé"],
        ]
      ),
    ],
    tasks: [
      writing(
        "note-finale",
        "Rédiger la note finale",
        "Produisez une note de décision en quatre parties : constat, recommandation, conditions de réussite, limites et prochaine mesure. Adressez-vous à une direction qui doit arbitrer 600 000 FCFA.",
        [
          ["constat", "Constat et apprentissages", 35, "Ce qui est établi"],
          [
            "recommandation",
            "Recommandation budgétaire",
            45,
            "Priorité et vagues",
          ],
          [
            "conditions",
            "Conditions et seuils",
            35,
            "Quand amplifier ou corriger",
          ],
          [
            "limites",
            "Limites et prochaine mesure",
            35,
            "Ce qui reste incertain",
          ],
        ]
      ),
    ],
    rubric: [
      "Synthèse fidèle aux données",
      "Budget conditionnel et capacité protégée",
      "Limites présentées sans dramatisation",
      "Note corrigée manuellement sur la décision et l’argumentation",
    ],
  },
];

const simplifyTask = (task: WorkTask): WorkTask => {
  if (
    task.kind === "placement" ||
    task.kind === "cloze" ||
    task.kind === "ordering"
  ) {
    const slotLimit =
      task.id === "diag-axes" ||
      task.id === "audience-cloze" ||
      task.id === "operations-cloze" ||
      task.kind === "ordering"
        ? 4
        : task.slots.length;
    const slots = task.slots.slice(0, slotLimit);
    const expectedLabelsByTask: Record<string, string[]> = {
      "diag-axes": [
        "Comparer les visites qualifiées",
        "Ne pas confondre portée et demande",
        "Documenter la source manquante",
        "Répartir le test sur 14 jours",
      ],
      "audience-cloze": ["besoin", "contexte", "promesse", "priorite"],
      "parcours-ordre": [
        "Observer les abandons",
        "Nommer l’intention principale",
        "Réduire les champs nécessaires",
        "Proposer une ressource adaptée",
      ],
      "editorial-funnel": [
        "Faire remarquer un problème",
        "Rendre la méthode concrète",
        "Donner un élément vérifiable",
        "Réduire une hésitation",
      ],
      "adaptation-decision": [
        "Lire le taux et la capacité",
        "Corriger le point faible prioritaire",
        "Libérer une nouvelle vague",
        "Vérifier le seuil après la vague",
      ],
      "operations-ordre": [
        "Vérifier le consentement",
        "Classer par besoin et délai",
        "Envoyer une réponse contextualisée",
        "Proposer une ressource utile",
      ],
      "operations-cloze": ["consentement", "contexte", "délai", "ressource"],
    };
    const expected = expectedLabelsByTask[task.id] ?? [];
    const expectedTokens = expected
      .map(label => task.tokens.find(token => token.label === label))
      .filter(Boolean) as { id: string; label: string }[];
    const distractors = task.tokens
      .filter(token => !expected.includes(token.label))
      .slice(0, Math.max(4, slotLimit));
    const result = {
      ...task,
      slots,
      tokens: [distractors[0], ...expectedTokens, ...distractors.slice(1)],
    } as WorkTask;
    if (task.kind === "cloze") {
      const passages: Record<string, string> = {
        "audience-cloze": `Une segmentation utile part du {${task.id}-a}, décrit le {${task.id}-b}, formule une {${task.id}-c} et fixe une {${task.id}-d}.`,
        "operations-cloze": `Une relation utile vérifie le {${task.id}-a}, conserve le {${task.id}-b}, annonce un {${task.id}-c} et joint une {${task.id}-d}.`,
      };
      (result as any).passage = passages[task.id] ?? task.passage;
    }
    return result;
  }
  if (task.kind === "numeric") {
    const limits: Record<string, string[]> = {
      "diag-calcul": [
        "diag-calcul-visites-total",
        "diag-calcul-demandes-total",
        "diag-calcul-taux-demande",
        "diag-calcul-jours-capacite",
      ],
      "budget-calcul": ["budget-calcul-sous-total", "budget-calcul-vague"],
      "ab-calcul": [
        "ab-calcul-ctr-a",
        "ab-calcul-ctr-b",
        "ab-calcul-taux-demande-a",
        "ab-calcul-net-b",
      ],
      "adaptation-calcul": [
        "adaptation-calcul-taux-demande",
        "adaptation-calcul-cout-demande",
        "adaptation-calcul-delai-marge",
        "adaptation-calcul-taux-reponse",
      ],
      "diagnostic-final-calcul": [
        "diagnostic-final-calcul-taux-visite",
        "diagnostic-final-calcul-taux-demande",
        "diagnostic-final-calcul-taux-rdv",
        "diagnostic-final-calcul-taux-presence",
        "diagnostic-final-calcul-taux-inscription",
      ],
    };
    const selected = limits[task.id];
    return selected
      ? {
          ...task,
          fields: task.fields.filter(field => selected.includes(field.id)),
        }
      : task;
  }
  if (task.kind === "writing") {
    const limits: Record<string, number> = {
      "diag-ecrit": 1,
      "audience-ecrit": 1,
      "parcours-ecrit": 1,
      "budget-justification": 1,
      "editorial-tableau": 3,
      "ab-analyse": 2,
      "qualification-synthese": 1,
      "adaptation-note": 1,
      "crise-plan": 1,
      "operations-note": 1,
      "diagnostic-final-note": 1,
      "note-finale": 3,
    };
    const count = limits[task.id];
    return count
      ? {
          ...task,
          fields: task.fields.slice(0, count).map(field => ({
            ...field,
            minWords: Math.min(field.minWords ?? 1, 30),
          })),
        }
      : task;
  }
  if (task.kind === "dialogue")
    return {
      ...task,
      turns: task.turns
        .slice(0, 3)
        .map(turn => ({ ...turn, minWords: Math.min(turn.minWords, 15) })),
    };
  return task;
};

const sectionDefinitions: [string, string, string[]][] = [
  [
    "section-01-diagnostic",
    "Comprendre la situation",
    ["atelier-01-diagnostic", "atelier-02-audience"],
  ],
  [
    "section-02-parcours-budget",
    "Choisir un parcours et un budget",
    ["atelier-03-parcours", "atelier-04-budget"],
  ],
  [
    "section-03-contenu-mesure",
    "Construire le contenu et mesurer",
    ["atelier-05-editorial", "atelier-06-ab"],
  ],
  [
    "section-04-client-pilotage",
    "Répondre au client et piloter",
    ["atelier-07-conversation", "atelier-08-adaptation"],
  ],
  [
    "section-05-relation-suivi",
    "Gérer la relation et le suivi",
    ["atelier-09-crise", "atelier-10-operations"],
  ],
  [
    "section-06-decision-finale",
    "Présenter la décision finale",
    ["atelier-11-diagnostic-final", "atelier-12-note-finale"],
  ],
];

export const workshops: Workshop[] = sectionDefinitions.map(
  ([id, title, ids], index) => {
    const parts = ids.map(
      partId => detailedWorkshops.find(workshop => workshop.id === partId)!
    );
    return {
      id,
      sequence: index + 1,
      title,
      minutes: 15,
      brief:
        "Cette section regroupe deux étapes de la mission Naya Conseil. Les consignes sont guidées, une erreur n’arrête pas le parcours et les productions écrites sont corrigées sur leur qualité.",
      documents: parts.flatMap(part => part.documents),
      tasks: parts.flatMap(part => part.tasks.map(simplifyTask)),
      rubric: parts
        .flatMap(part => part.rubric)
        .filter((item, itemIndex, all) => all.indexOf(item) === itemIndex),
    };
  }
);

const voice = (
  id: string,
  title: string,
  instructions: string,
  prompt: string,
  maxSeconds = 90
): WorkTask => ({
  id,
  kind: "voice",
  title,
  instructions,
  prompt,
  maxSeconds,
});

export const gmsWorkshops: Workshop[] = [
  {
    id: "gms-section-01-editorial",
    sequence: 1,
    title: "Section 1 : Ligne éditoriale & Planning de publication",
    minutes: 30,
    brief: "Analysez la marque BijouxWax et organisez son calendrier de publication multicanal avant de formaliser ses piliers éditoriaux.",
    documents: [
      doc(
        "Fiche de marque — BijouxWax",
        ["Canal", "Cible", "Format recommandé", "Objectif"],
        [
          ["Instagram", "Jeunes femmes 18-35 ans", "Reels & Carrousels", "Notoriété & Découverte"],
          ["LinkedIn", "Partenaires B2B & Boutiques", "Articles & Posts texte", "Crédibilité professionnelle"],
          ["TikTok", "Gen Z & Étudiantes", "Vidéos courtes coulisses", "Viralité & Communauté"],
          ["Facebook", "Familles & Acheteuses locales", "Photos & Événements", "Fidélisation & Commandes"],
        ]
      ),
    ],
    tasks: [
      placement(
        "gms-task-01-planning",
        "Activité 1 : Attribution des formats par réseau",
        "Placez chaque format de contenu sur le canal le plus performant pour BijouxWax.",
        ["Instagram", "LinkedIn", "TikTok", "Facebook"],
        [
          "Carrousel 5 slides conseils style",
          "Post retour d'expérience entrepreneuriat",
          "Vidéo coulisses fabrication 15s",
          "Album photos nouvelle collection",
        ]
      ),
      writing(
        "gms-task-02-piliers",
        "Activité 2 : Définition des 2 piliers éditoriaux et accroches",
        "Rédigez les 2 piliers majeurs de contenu pour BijouxWax avec un exemple d'accroche pour chacun (15 mots minimum par pilier).",
        [
          ["pilier-1", "Pilier 1 : Éducation et savoir-faire artisanal (15 mots min)", 15, "Ex. Saviez-vous que le wax authentique se distingue par..."],
          ["pilier-2", "Pilier 2 : Preuve sociale et coulisses de création (15 mots min)", 15, "Ex. De notre petit atelier à votre quotidien, découvrez..."],
        ]
      ),
    ],
    rubric: [
      "Cohérence entre canal et format de publication",
      "Qualité d'accroche et clarté des piliers éditoriaux",
    ],
  },
  {
    id: "gms-section-02-ads-budget",
    sequence: 2,
    title: "Section 2 : Campagnes payantes & Arbitrage budgétaire",
    minutes: 30,
    brief: "Vous disposez d'une enveloppe de 300 000 FCFA pour lancer la collection de fin d'année. Allouez le budget et vérifiez les indicateurs de performance.",
    documents: [
      doc(
        "Données de simulation publicitaire",
        ["Levier publicitaire", "Coût moyen par clic (CPC)", "Taux de conversion estimé"],
        [
          ["Meta Ads (Instagram / Facebook)", "80 FCFA", "3,5 %"],
          ["TikTok Ads (Spark Ads)", "60 FCFA", "2,8 %"],
          ["Création de contenu (Vidéos/Photos)", "Forfait fixe", "Impact direct sur le CTR"],
        ]
      ),
    ],
    tasks: [
      numeric(
        "gms-task-03-budget",
        "Activité 1 : Répartition du budget de campagne",
        "Répartissez exactement 300 000 FCFA entre les 3 postes de dépenses de manière équilibrée.",
        [
          ["meta-budget", "Meta Ads (Notoriété & Retargeting)", "FCFA"],
          ["tiktok-budget", "TikTok Spark Ads (Trafic & Portée)", "FCFA"],
          ["crea-budget", "Production de contenus & Visuels", "FCFA"],
        ],
        "budget",
        300000
      ),
      numeric(
        "gms-task-04-calculs",
        "Activité 2 : Calculs des métriques de rentabilité",
        "Calculez le CTR (%) et le ROAS à partir des résultats observés (dépense 150 000 FCFA, revenus 450 000 FCFA, 50 000 impressions, 1 500 clics).",
        [
          ["ctr-calcule", "CTR observé (1 500 / 50 000 en %)", "%"],
          ["roas-calcule", "ROAS obtenu (450 000 / 150 000)", "ratio"],
        ]
      ),
    ],
    rubric: [
      "Exactitude de l'allocation budgétaire à 300 000 FCFA",
      "Justesse des calculs de CTR (3 %) et de ratio ROAS (3)",
    ],
  },
  {
    id: "gms-section-03-conversation-crise",
    sequence: 3,
    title: "Section 3 : Marketing conversationnel & Modération de crise",
    minutes: 30,
    brief: "Un colis a subi un retard de livraison et une cliente publie un commentaire négatif viral sur la page. Organisez la riposte et concevez le parcours de réponse.",
    documents: [
      doc(
        "Protocole de modération en situation sensible",
        ["Phase", "Action clé", "Objectif"],
        [
          ["Étape 1", "Détection et préservation du calme", "Éviter la suppression impulsive"],
          ["Étape 2", "Réponse publique bienveillante", "Montrer le professionnalisme de la marque"],
          ["Étape 3", "Basculement en message privé", "Résoudre le litige confidentiellement"],
          ["Étape 4", "Dédommagement et suivi", "Fidéliser et clôturer positivement"],
        ]
      ),
    ],
    tasks: [
      ordering(
        "gms-task-05-crise",
        "Activité 1 : Chronologie du protocole de crise",
        "Remettez dans l'ordre chronologique les 4 étapes de gestion de crise.",
        ["Étape 1", "Étape 2", "Étape 3", "Étape 4"],
        [
          "Identifier le commentaire et vérifier la réclamation sans supprimer",
          "Publier une réponse courtoise reconnaissant le problème",
          "Inviter la cliente en messagerie privée (WhatsApp / MP)",
          "Apporter une solution concrète (remboursement ou renvoi express)",
        ]
      ),
      voice(
        "gms-task-06-audio",
        "Activité 2 : Message vocal client de dédommagement",
        "Enregistrez au micro (ou saisissez le script) du message vocal chaleureux adressé à la cliente sur WhatsApp pour désamorcer le mécontentement (45 à 90 secondes).",
        "Exprimez des excuses professionnelles, expliquez la cause du retard, offrez un geste commercial (remise de 20%) et confirmez la nouvelle date de livraison."
      ),
    ],
    rubric: [
      "Respect scrupuleux de l'éthique de modération",
      "Ton professionnel, empathique et axé sur la solution dans le message vocal",
    ],
  },
  {
    id: "gms-section-04-data-reporting",
    sequence: 4,
    title: "Section 4 : Data, Reporting & Recommandations client",
    minutes: 30,
    brief: "À la clôture du mois, analysez les performances de la communauté et formulez 3 recommandations stratégiques pour le client.",
    documents: [
      doc(
        "Tableau de bord de performance mensuelle",
        ["Métrique", "Mois M-1", "Mois M (Réalisé)", "Objectif"],
        [
          ["Abonnés totaux", "12 400", "15 200", "+ 2 000"],
          ["Interactions totales (likes, partages, comm.)", "3 100", "4 800", "4 000"],
          ["Taux d'engagement moyen", "2,8 %", "3,9 %", "3,5 %"],
          ["Commandes issues des réseaux", "85", "142", "120"],
        ]
      ),
    ],
    tasks: [
      numeric(
        "gms-task-07-analyse",
        "Activité 1 : Calcul des variations mensuelles",
        "Calculez le gain net d'abonnés et les commandes supplémentaires par rapport au mois précédent.",
        [
          ["croissance-abonnes", "Gain net d'abonnés (15 200 - 12 400)", "abonnés"],
          ["gain-commandes", "Commandes supplémentaires (142 - 85)", "commandes"],
        ]
      ),
      writing(
        "gms-task-08-synthese",
        "Activité 2 : Note de synthèse et 3 recommandations",
        "Rédigez la note de synthèse finale comprenant l'interprétation des résultats et 3 recommandations d'optimisation (35 mots minimum).",
        [
          ["note-synthese", "Recommandations stratégiques pour le mois suivant (35 mots min)", 35, "Au vu de la forte croissance des interactions portée par les formats courts..."],
        ]
      ),
    ],
    rubric: [
      "Exactitude de l'analyse chiffrée",
      "Pertinence opérationnelle des recommandations",
    ],
  },
];

export function getWorkshopsForCohort(cohort?: string): Workshop[] {
  if (cohort === "Gestion des médias sociaux") {
    return gmsWorkshops;
  }
  return workshops;
}

export default workshops;
