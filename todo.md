# Project TODO

- [x] Définir le modèle de données des modules, leçons, livrables, évaluations, soumissions, corrections et déblocages manuels.
- [x] Structurer le contenu pédagogique et les évaluations à partir des deux PDF fournis.
- [x] Mettre en place les rôles sécurisés formateur et élève pour la filière Gestion des médias sociaux uniquement.
- [x] Concevoir le tableau de bord élève, avec progression, résultats, commentaires et accès conditionnel aux cours.
- [x] Concevoir le tableau de bord formateur, avec suivi des élèves, soumissions à corriger et contrôles de déblocage.
- [x] Implémenter le dépôt sécurisé des livrables PDF, Word et texte vers Amazon S3.
- [x] Implémenter les quiz QCM à choix unique ou multiple et les questions de rédaction libre.
- [x] Appliquer la règle de verrouillage : soumission et validation formateur obligatoires avant l’accès au cours suivant, avec déblocage manuel par élève.
- [x] Implémenter les corrections manuelles, l’attribution de notes et les commentaires formateur.
- [x] Intégrer une assistance de correction par IA limitée à des suggestions modifiables et validables par le formateur.
- [x] Écrire et exécuter les tests unitaires des règles d’accès et de progression.
- [x] Vérifier l’interface sur ordinateur et mobile, puis enregistrer une version livrable.
- [x] Compléter la structure pédagogique avec les modules WhatsApp Ads et Google Ads présents dans le manuel.
- [x] Restreindre l’accès élève aux seuls comptes explicitement autorisés par le formateur pour cette filière.
- [x] Afficher des états d’erreur explicites dans les vues formateur pour les tableaux de bord, corrections et évaluations.
- [x] Afficher les échecs de lecture ou d’envoi lors du dépôt d’un livrable vers S3.
- [x] Afficher les échecs de correction manuelle et de suggestion IA avec un retour exploitable au formateur.
- [x] Afficher une erreur dédiée lors de l’ouverture détaillée d’une soumission à corriger.
- [x] Tester le refus des élèves non autorisés ou suspendus et l’autorisation des élèves inscrits actifs.
- [x] Tester le refus des procédures formateur pour un élève et le refus des procédures élève sans session.
- [x] Ajouter des échéances de livrables et d’évaluations avec états de retard.
- [x] Ajouter des rappels et notifications de publication, échéance, retard, correction et déblocage.
- [x] Ajouter des barèmes de correction réutilisables avec critères pondérés.
- [x] Ajouter un flux de reprise permettant de demander et soumettre une nouvelle version d’un travail.
- [x] Ajouter un journal historique des dépôts, corrections, notes, déblocages et changements de statut.
- [x] Ajouter un export des résultats et avancements de la cohorte au format CSV.
- [x] Ajouter des indicateurs formateur sur les retards, moyennes et questions les plus difficiles.
- [x] Ajouter une bibliothèque de ressources pédagogiques par module.
- [x] Permettre au formateur de créer, modifier et réorganiser les modules, cours, exercices et consignes existants.
- [x] Tester les nouveaux flux d’édition, d’échéance, de reprise et d’export avant livraison.
- [x] Activer le rappel quotidien automatique des échéances après publication de la plateforme.
- [x] Analyser les deux manuels Business digital et isoler les contenus admissibles hors e-commerce.
- [x] Créer une filière Business digital distincte avec ses modules, leçons, livrables et évaluations.
- [x] Donner au formateur un contrôle distinct des contenus et des apprenants de la filière Business digital.
- [x] Garantir que les élèves ne voient que les parcours de leur filière autorisée.
- [x] Vérifier le programme Business digital, les exclusions e-commerce et les règles d’accès avant livraison.
- [x] Ajouter une vue formateur filtrée par filière pour les apprenants, corrections et indicateurs.
- [x] Ajouter des tests d’accès démontrant que chaque élève ne charge que les modules de sa cohorte.
- [x] Vérifier explicitement l’API et l’interface du parcours Business digital après affectation de la filière.
- [x] Filtrer la file de livrables et les métriques formateur par filière.
- [x] Ajouter des tests serveur/tRPC de chargement réel de parcours par cohorte.
- [x] Vérifier l’API et l’interface du parcours Business digital pour un élève affecté à cette filière.
- [x] Ajouter un filtre de cohorte aux cartes de synthèse du tableau de bord formateur.
- [x] Ajouter un test d’intégration de chargement réel du parcours selon la cohorte.
- [x] Produire une vérification API/UI ciblée d’un parcours élève Business digital attribué.
- [x] Vérifier le chargement réel du parcours Business digital avec une cohorte active en base.
- [x] Vérifier par API qu’un élève Business digital ne reçoit que ses modules dédiés.
- [x] Vérifier visuellement le parcours d’un élève connecté à Business digital.
- [x] Afficher clairement les nouveaux inscrits en attente d’affectation de filière.
- [x] Permettre au formateur de sélectionner explicitement l’une des deux filières avant d’autoriser l’accès.
- [x] Vérifier que l’élève ne reçoit aucun parcours tant que la filière et l’accès ne sont pas validés.
- [x] Afficher un statut « À affecter » spécifique aux nouveaux inscrits sans filière.
- [x] Tester le refus de la procédure student.program pour un élève sans inscription active ni filière.
- [x] Vérifier l’absence de parcours et le message d’attente pour un nouvel inscrit non affecté.
- [x] Ajouter un test tRPC de refus de student.program pour un élève authentifié sans filière active.
- [x] Vérifier côté API et interface l’écran d’attente sans modules d’un élève non affecté.
- [x] Vérifier visuellement l’écran d’attente d’un élève non affecté, sans modules accessibles.
- [x] Transmettre la filière choisie avec l’action d’autorisation afin d’éviter toute ambiguïté pour un nouvel inscrit.
- [x] Calculer et afficher le retard des livrables remis après leur échéance.
- [x] Ajouter les notifications de publication de contenu et de retard, en plus des rappels d’échéance.
- [x] Rendre les barèmes réutilisables entre plusieurs évaluations.
- [x] Étendre les reprises aux livrables et appliquer les options de reprise côté backend.
- [x] Ajouter un indicateur de retards dans les analyses formateur.
- [x] Afficher les ressources pédagogiques dans l’espace élève de chaque module.
- [x] Ajouter des tests ciblés pour l’édition, la reprise, l’export et les règles de retard.
- [x] Ajouter une interface formateur pour copier un barème existant vers une autre évaluation.
- [x] Afficher dans le module élève la demande de reprise de livrable et sa consigne formateur.
- [x] Afficher les ressources directement dans la vue détaillée de chaque module élève.
- [x] Ajouter des tests dédiés à l’édition, aux reprises et aux retards réels.
- [x] Ajouter des tests serveur pour les mutations d’édition de contenu formateur.
- [x] Ajouter des tests métier des reprises d’évaluation et de livrable, y compris les autorisations.
- [x] Ajouter des tests métier du statut de retard lors des dépôts et soumissions réels.
- [x] Rendre la navigation, les cartes et les tableaux parfaitement exploitables sur mobile comme sur ordinateur.
- [x] Corriger l’affichage mobile des notifications afin que leurs titres, contenus et dates ne soient jamais tronqués.
- [x] Retirer l’affichage et la saisie des durées estimées de toutes les leçons.
- [x] Permettre au formateur de prévisualiser, télécharger et corriger un livrable PDF déposé, y compris avec l’assistance IA.
- [x] Réécrire les énoncés de cas pratiques pour afficher systématiquement la situation complète et toutes les questions attendues.
- [x] Ajouter un détail interactif des indicateurs pour identifier les élèves en difficulté sur chaque quiz ou question.
- [x] Ajouter et exécuter les tests des correctifs mobile, livrables, énoncés et indicateurs détaillés.
- [x] Vérifier les vues authentifiées essentielles sur mobile, y compris les cartes et tableaux formateur/apprenant.
- [x] Réécrire explicitement les cas pratiques dans les contenus avec leurs mises en situation et consignes détaillées propres à chaque module.
- [x] Ajouter des tests ciblés du flux de revue de livrable PDF, des détails d’indicateurs et de l’interface responsive.
- [x] Vérifier en session authentifiée les vues mobile élève et formateur, notamment les cartes, tableaux et la navigation.
- [x] Ajouter des tests fonctionnels du flux de revue PDF : ouverture, téléchargement, suggestion IA et enregistrement de correction.
- [x] Ajouter des tests fonctionnels du détail d’indicateurs par question et une validation responsive exécutée.
- [x] Couvrir dans un test unique l’ouverture, le téléchargement, la suggestion IA et l’enregistrement final de correction d’un PDF.
- [x] Couvrir fonctionnellement le contenu nominatif retourné par le détail d’indicateurs d’une question.
- [x] Vérifier réellement le responsive sur les vues authentifiées élève et formateur.
- [x] Ajouter un test unique du flux PDF couvrant explicitement ouverture, téléchargement, suggestion IA et enregistrement final.
- [x] Vérifier dans le scénario unique l’accès HTTP au fichier PDF avant la correction IA et l’enregistrement final.
- [x] Vérifier un accès HTTP réel au lien de stockage PDF généré avant la correction IA et l’enregistrement final.
- [x] Contrôler l’inscription active et les modules réellement exposés au nouvel élève Business digital.
- [x] Vérifier l’espace élève Business digital sur mobile après sa première connexion.
- [x] Corriger l’indisponibilité de la suggestion IA lors de la revue d’un livrable PDF.
- [x] Rétablir les questions QCM, les questions rédactionnelles et les mises en situation complètes dans toutes les évaluations de fin de module.
- [x] Afficher les notes de chaque élève pour chacun de ses modules dans l’espace formateur.
- [x] Calculer automatiquement la moyenne générale par élève et l’ajouter à l’export CSV de cohorte.
- [x] Ajouter et exécuter les tests des évaluations complètes, de la correction IA PDF et des moyennes/exportations.
- [x] Ajouter un test ciblé vérifiant les QCM, la rédaction et la mise en situation dans une évaluation complète.
- [x] Valider par test le rendu élève des sections « Partie Quiz » puis « Partie Rédaction » avec le cas pratique.
- [x] Ajouter un test de rendu fonctionnel d’une évaluation élève avec QCM, rédaction et mise en situation.
- [x] Valider au rendu React l’affichage effectif des sections Quiz et Rédaction du cas pratique.
- [x] Vérifier par appel applicatif réel que l’élève Business digital ne reçoit que BD1 à BD7.
- [x] Vérifier explicitement que l’API Business digital retourne exactement BD1 à BD7 et aucun autre module.
- [x] Vérifier sur des sessions authentifiées les écrans mobile critiques élève et formateur.
- [x] Identifier le compte élève sans accès actif et son statut d’inscription exact.
- [x] Rendre ce compte clairement visible et autorisable depuis la liste formateur.
- [x] Tester et publier le correctif de gestion des élèves en attente.
- [x] Publier le panneau prioritaire d’autorisation des élèves en attente.
- [x] Vérifier en production l’affichage du panneau d’autorisation dans l’espace formateur.
- [x] Conserver une vérification explicitement authentifiée de la vue formateur publiée avec le panneau « Action requise ».
- [x] Identifier et afficher le compte moufidathbankole@gmail.com dans les élèves en attente d’autorisation.
- [x] Diagnostiquer et corriger l’indisponibilité réelle de la suggestion IA pour le livrable PDF déposé.
- [x] Tester et publier les correctifs d’autorisation et de suggestion IA.
- [x] Confirmer l’accessibilité de la version publiée avec l’actualisation des inscrits et le repli IA PDF.
- [x] Vérifier en production que les comptes Moufidath en attente apparaissent automatiquement dans la zone d’autorisation.
- [x] Vérifier en production le repli de suggestion IA sur le PDF historique avec réponse modèle incomplète.
- [x] Tester le repli de suggestion lorsque le modèle IA renvoie un JSON incomplet ou malformé.
- [x] Prioriser tous les inscrits sans accès afin de les rendre visibles avant les comptes déjà autorisés.
- [x] Garantir qu’un élève autorisé reste visible et dispose des actions de déblocage de modules.
- [x] Tester et publier le correctif des actions de déblocage post-autorisation.
- [x] Identifier et corriger la procédure de suggestion IA appelée par l’interface de correction PDF.
- [x] Tester l’affichage d’une suggestion exploitable dans la modale de correction puis publier le correctif.
- [x] Tester le repli de suggestion IA de la procédure d’évaluation lorsqu’elle reçoit une réponse malformée ou échoue.
- [x] Vérifier la mutation réellement appelée par la modale de correction affichée et son retour de suggestion.
- [x] Publier et vérifier le correctif final de suggestion IA dans la modale formateur.
- [x] Diagnostiquer pourquoi la modale d’évaluation reçoit systématiquement la suggestion prudente générique à 20 %.
- [x] Produire une suggestion de correction détaillée fondée sur les réponses de l’élève lorsque le modèle IA est disponible.
- [x] Vérifier sur mobile la suggestion détaillée, puis publier le correctif final.
- [x] Permettre au formateur de rouvrir une évaluation déjà corrigée pour modifier la note et le commentaire.
- [x] Notifier l’apprenant lorsqu’une note ou un commentaire d’évaluation est rectifié.
- [x] Tester puis publier le flux de rectification d’une évaluation déjà corrigée.
- [x] Publier la rectification d’évaluation puis vérifier le parcours formateur et la notification de correction actualisée.
- [x] Permettre au formateur de créer et modifier un corrigé type pour chaque évaluation.
- [x] Permettre au formateur de sélectionner les apprenants destinataires d’un corrigé type.
- [x] Afficher le corrigé type uniquement aux apprenants choisis et leur envoyer une notification.
- [x] Tester puis publier le flux de corrigé type à envoi sélectif.
- [x] Publier et vérifier le flux de corrigé type sélectif sur la version publiée.
- [x] Ajouter une suggestion IA de corrigé type à l’éditeur formateur.
- [x] Regrouper la sélection d’évaluations et de corrigés types par filière Business digital ou Gestion des médias sociaux.
- [x] Analyser les nouveaux PDF Business digital et enrichir les contenus concrets des modules de cette filière.
- [x] Enrichir les contenus concrets des modules de Gestion des médias sociaux à partir des supports déjà fournis.
- [x] Tester et publier les améliorations de suggestion IA, de regroupement par filière et de contenus pédagogiques.
- [x] Conserver les suggestions IA précédentes de corrigé type pour chaque évaluation.
- [x] Permettre au formateur de restaurer une suggestion IA précédente dans l’éditeur.
- [x] Tester et publier le retour à une suggestion de corrigé type antérieure.
- [x] Vérifier sur la version publiée, en session formateur, la restauration d’une suggestion précédente puis l’enregistrement et l’envoi du corrigé type.
- [x] Permettre au formateur de saisir des consignes personnalisées avant la génération IA d’un corrigé type.
- [x] Transmettre les consignes du formateur à l’IA de manière bornée et afficher une proposition toujours modifiable.
- [x] Tester et publier les consignes personnalisées de génération de corrigé type.
- [x] Retirer la section « Supports de cours par module » de toutes les filières et tous les modules.
- [x] Exclure tout contenu e-commerce lors de l’intégration des supports Business Digital autorisés.
- [x] Retirer le bloc de cas pratique affiché avant l’évaluation dans toutes les filières.
- [x] Rendre chaque leçon ouvrable avec le contenu de cours correspondant issu des PDF de sa filière.
- [x] Réaligner les évaluations Quiz/rédaction et les livrables portfolio sur les consignes des PDF de chaque filière.
- [x] Moderniser l’interface avec effets, animations et comportement mobile accessibles.
- [x] Tester puis publier la refonte pédagogique et visuelle.
- [x] Corriger l’erreur mobile qui empêche l’ouverture des modules et des évaluations.
- [x] Corriger le décalage de la mise en page sur petits écrans.
- [x] Rendre les notifications cliquables et les relier à la section ou action concernée.
- [x] Ajouter un profil apprenant modifiable avec nom et âge, accessible depuis l’avatar.
- [x] Remplacer le message d’accueil générique par « Bonjour, [nom de l’apprenant] ».
- [x] Repenser le style mobile dans une direction éditoriale inspirée d’Esmerise, sans reproduction à l’identique.
- [x] Tester puis publier le parcours mobile, le profil et les notifications actionnables.
- [x] Remplacer le téléchargement du PDF par une visionneuse intégrée de la page de cours correspondant à chaque leçon.
- [x] Afficher chaque mise en situation complète avant les questions de rédaction.
- [x] Corriger les titres et descriptions de modules coupés sur mobile en adaptant la hauteur des cartes.
- [x] Positionner les notifications ouvertes au-dessus du contenu de module, sans masquage par les encadrés.
- [x] Retirer les indicateurs de « Mon parcours » et les afficher uniquement dans « Mes résultats », avec la note par module en priorité.
- [x] Raffiner la palette, la typographie et les éléments graphiques dans une direction Esmerise sans reproduction à l’identique.
- [x] Tester puis publier la consultation intégrée, les évaluations et le parcours mobile mis à jour.
- [x] Remplacer les aperçus d’images PDF par une retranscription textuelle structurée de chaque leçon concernée.
- [x] Reproduire dans les leçons les tableaux, encadrés et hiérarchies utiles des portions autorisées de cours.
- [x] Retirer les couleurs vertes restantes et uniformiser l’interface en bleu et blanc.
- [x] Corriger la superposition du panneau de notifications afin qu’il s’affiche au-dessus de toutes les cartes sur mobile.
- [x] Tester puis publier la consultation textuelle, la palette bleu-blanc et les notifications au premier plan.
- [x] Corriger les clics de notifications pour ouvrir systématiquement le module, la page de résultats ou la reprise concernés.
- [x] Retirer « Notes par module » et « À corriger » de Mes résultats, puis placer « Devoirs à reprendre » en premier.
- [x] Développer le contenu textuel de chaque leçon Business Digital avec tous ses objectifs détaillés.
- [x] Développer le contenu textuel de chaque leçon Gestion des médias sociaux avec tous ses objectifs détaillés.
- [x] Tester puis publier les redirections de notifications, les résultats simplifiés et les cours complétés.
- [x] Supprimer automatiquement les notifications déjà consultées après sept jours.
- [x] Réécrire chaque leçon Business Digital avec un contenu propre, complet et aligné sur son titre.
- [x] Réécrire chaque leçon Gestion des médias sociaux avec un contenu propre, complet et aligné sur son titre.
- [x] Vérifier qu’aucune section de cours ne se répète entre deux leçons différentes.
- [x] Tester puis publier la suppression après sept jours et les leçons intégralement réécrites.
- [x] Cartographier les pages exactes des PDF autorisés pour chaque leçon des deux filières.
- [x] Retranscrire fidèlement le pré-cours Gestion des médias sociaux, dont la leçon « Métiers du numérique », tableaux et exemples inclus.
- [x] Retranscrire fidèlement les leçons du manuel Gestion des médias sociaux, sans résumé ni contenu générique.
- [x] Retranscrire fidèlement le pré-cours et le manuel Business Digital autorisés, sans aucun contenu e-commerce.
- [x] Remplacer les contenus actuels par les retranscriptions exactes, puis tester et publier.
- [x] Corriger le chargement de la première leçon du module 1 Gestion des médias sociaux.
- [x] Mettre en forme les transcriptions Gestion des médias sociaux avec titres, listes, encadrés et tableaux tracés.
- [x] Mettre en forme les transcriptions Business Digital avec titres, listes, encadrés et tableaux tracés.
- [x] Tester puis publier le lecteur de cours complet et mis en forme.
- [x] Auditer les bornes de début et de fin de chaque leçon afin d’éliminer toute coupure de contenu.
- [x] Reconstruire explicitement les tableaux Gestion des médias sociaux avec colonnes et lignes fidèles au support.
- [x] Reconstruire explicitement les tableaux Business Digital avec colonnes et lignes fidèles au support autorisé.
- [x] Réviser les encadrés, cas pratiques et exercices afin qu’ils restent dans leur leçon complète.
- [x] Tester puis publier le lecteur de cours exhaustif, non coupé et correctement tabulé.
- [x] Ajouter un accès d’évaluation contrôlé par le formateur, distinct de l’accès aux leçons.
- [x] Ajouter une commande formateur pour ouvrir ou bloquer l’évaluation de chaque module.
- [x] Empêcher les apprenants de consulter ou composer une évaluation non autorisée.
- [x] Remplacer les libellés « Gestion des médias sociaux » isolés par une identité adaptée aux deux filières.
- [x] Tester puis publier le verrou d’évaluation et l’identité bi-filière.
- [x] Supprimer le rendu du texte brut afin qu’une seule transcription mise en forme s’affiche par leçon.
- [x] Corriger la première leçon du module 1 du pré-cours Gestion des médias sociaux afin qu’elle s’affiche intégralement.
- [x] Faire commencer la leçon 2 du pré-cours directement au module concerné, sans calendrier, semaines, séances ni introduction générale.
- [x] Isoler chaque leçon entre son titre source et le titre suivant afin d’éliminer les cours entrecoupés ou mélangés.
- [x] Revoir les tableaux et encadrés après l’isolation des leçons pour éviter les répétitions.
- [x] Tester puis publier le lecteur de cours sans doublon ni contenu coupé.
- [x] Remplacer l’extraction dynamique par des transcriptions déterministes, une source validée par leçon.
- [x] Construire intégralement les deux leçons du pré-cours Gestion des médias sociaux sans calendrier général ni contenu tronqué.
- [x] Construire et valider les leçons du manuel Gestion des médias sociaux sans chevauchement de cours.
- [x] Construire et valider les leçons Business Digital à partir des seuls supports autorisés, sans e-commerce.
- [x] Rendre les tableaux uniquement lorsqu’ils sont reconstruits avec des colonnes complètes et vérifiées.
- [x] Tester chaque ouverture de leçon et publier le lecteur de cours déterministe.

- [x] Rendre le bouton « Se déconnecter » toujours visible et accessible depuis l’avatar, sur ordinateur et mobile.
- [x] Vérifier et clarifier le parcours formateur pour ouvrir ou bloquer chaque évaluation aux apprenants.
- [x] Tester puis publier les corrections d’accès aux évaluations et de déconnexion.

## Demandes ajoutées — accès évaluations et déconnexion

- [x] Vérifier l’emplacement de la commande « Ouvrir l’évaluation aux apprenants » dans l’espace formateur.
- [x] Ajouter une aide explicite indiquant que les évaluations sont verrouillées par défaut et qu’elles s’ouvrent depuis Contenus ou Évaluations.
- [x] Rendre la déconnexion disponible dans le menu avatar du formateur et de l’apprenant, avec une cible tactile adaptée au mobile.
- [x] Ajouter les tests UI de présence et d’action des commandes d’ouverture et de déconnexion.
- [x] Publier après validation TypeScript et tests.

# Project TODO

- [x] Finaliser les demandes ajoutées dans la dernière session.


## Demande ajoutée — évaluation sommative Business Digital

- [x] Ajouter un module final BD7 regroupant la théorie et la pratique des six modules Business Digital.
- [x] Prévoir une durée de composition de 2 heures et un barème total de 20 points.
- [x] Ajouter 10 questions théoriques et un cas pratique rédactionnel complet avec mise en situation et sous-questions.
- [x] Conserver le verrouillage formateur et la progression séquentielle avant l’accès à l’épreuve sommative.
- [x] Vérifier le rendu élève et l’affichage mobile de l’épreuve sommative.


## Ajustement — évaluation Business Digital approfondie

- [x] Porter la phase pratique chronométrée à 1 h 30 et réserver 30 minutes indicatives à la théorie.
- [x] Remplacer la simulation courte par 16 décisions professionnelles organisées en quatre phases.
- [x] Ajouter des données intermédiaires, arbitrages de budget, gestion de capacité, crise, expérimentation et recommandation finale.
- [x] Renforcer les dix QCM de BD7 avec des propositions plausibles et des raisonnements de niveau professionnel.
- [x] Synchroniser les nouveaux QCM dans BD7 tant qu’aucune copie n’a été soumise, afin de préserver les copies existantes.
- [x] Valider les tests, le typage et le build de production.


## Refonte pratique V3 — ateliers substantiels et interactions variées

- [x] Remplacer les 16 décisions rapides par 12 ateliers comportant 116 champs de réponse et 1 290 mots minimum de productions écrites ; plan de charge pédagogique de 90 minutes, non assimilé à une durée réelle mesurée.
- [x] Ajouter cartes à glisser-déposer (souris/tactile), sélection puis placement au clavier ou par toucher, textes à trous avec 24 cartes et distracteurs mélangés, remise en ordre, calculs, budget libre contraint, lignes éditoriales, analyse A/B, dialogues scénarisés à quatre tours et note de direction.
- [x] Conserver la poursuite après une erreur ; adapter les tableaux, les volumes, le délai et les demandes à partir des résultats antérieurs et de l’arbitrage budgétaire réellement saisi.
- [x] Ne pas noter automatiquement la qualité des écrits ou dialogues ; prévoir une correction manuelle /20 et un commentaire transmis à l’apprenant.
- [x] Enregistrer les brouillons, protéger l’accès par filière, empêcher la double validation et toute sauvegarde après la limite serveur de 1 h 30 ; préserver les anciennes copies sous leur version d’origine.
- [x] Créer un test complet formateur sans copie élève ni notification et une inspection libre par atelier depuis Simulations.
- [x] Réduire les illustrations Naya de 2,7–3,7 Mo à 15–25 Ko en WebP, sans grosses photos répétées dans chaque atelier.
- [x] Tester réellement en navigateur le drag souris, le placement tactile, les quatre tours de dialogue avec modification, les totaux du budget, le démarrage du chrono à la première saisie, la validation incomplète refusée, le passage à l’atelier suivant et le gel du chrono à la remise.
- [x] Vérifier le cadrage à 390 px et le défilement horizontal interne des tableaux ; tests serveur avec horloge simulée pour expiration à 90 minutes, verrouillage et notification idempotente.
- [x] Après publication de la V4 : activer depuis Simulations la clôture hors connexion (Heartbeat chaque minute, échéance serveur fixe) ; la tâche `cloture-SIM-BD-NAYA-04` est active et liée au callback publié.
- [x] Effectuer un essai pédagogique chronométré complet en mode test formateur et recalibrer la charge réelle : six sections, 76 champs et 555 mots minimaux guidés, sans garantir artificiellement 90 minutes pour tous les niveaux.


## Ajustement demandé — simulation en 6 sections

- [x] Regrouper les 12 ateliers en 6 sections pédagogiques plus lisibles, en conservant une progression et des conséquences compréhensibles.
- [x] Réduire le niveau de difficulté : consignes plus directes, moins de distracteurs, calculs plus guidés et productions écrites plus courtes.
- [x] Vérifier le chrono, les sauvegardes, la correction formateur et le rendu mobile après regroupement.


## Rentrée 2 — Novembre 2026

- [x] Ajouter le choix de filière et de rentrée lors de la première inscription.
- [x] Conserver la rentrée dans l’inscription, l’afficher au formateur et empêcher la modification après validation.
- [x] Relier les deux leçons du pré-cours Gestion des médias sociaux à des transcriptions complètes dédiées à la rentrée 2.
- [x] Appliquer la migration additive et valider 110 tests, le typage TypeScript et le build de production.
