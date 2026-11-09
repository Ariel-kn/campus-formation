# Guide de Déploiement Gratuit — Campus Médias

Ce guide vous explique étape par étape comment héberger gratuitement la plateforme **Campus Médias** pour la rendre accessible en ligne à vos apprenants et formateurs.

---

## Sommaire
1. [Nouveauté : Mode d'Accès Autonome (Zero Configuration)](#1-nouveauté--mode-daccès-autonome)
2. [Option A : Déploiement sur Render.com (Recommandé)](#2-option-a--déploiement-sur-rendercom-recommandé)
3. [Option B : Déploiement sur Replit (Le plus rapide sans GitHub)](#3-option-b--déploiement-sur-replit-le-plus-rapide)
4. [Option C : Base de données MySQL gratuite avec TiDB Cloud](#4-base-de-données-mysql-gratuite-avec-tidb-cloud)
5. [Variables d'environnement](#5-variables-denvironnement)

---

## 1. Nouveauté : Mode d'Accès Autonome

L'application intègre désormais un **Accès Démo Direct** sur la page d'accueil :
* **Formateur (Admin)** : accès immédiat au tableau de bord, à la file de correction des copies et à la gestion des étudiants.
* **Apprenant · Médias Sociaux** : accès au parcours complet GMS et à l'épreuve sommative de 2 heures avec modération vocale.
* **Apprenant · Business Digital** : accès au parcours complet BD et à l'épreuve sommative de 2 heures.

> Aucun compte Manus ni configuration OAuth complexe n'est requis pour tester la plateforme en ligne.

---

## 2. Option A : Déploiement sur Render.com (Recommandé)

Render propose un hébergement web gratuit avec certificat SSL (HTTPS) automatique.

### Étapes :
1. **Créer un compte** gratuit sur [render.com](https://render.com).
2. **Publier votre code sur GitHub** (si ce n'est pas déjà fait) :
   * Créez un nouveau dépôt privé ou public sur GitHub.
   * Poussez le dossier du projet sur ce dépôt.
3. **Créer un Web Service sur Render** :
   * Cliquez sur **New +** > **Web Service**.
   * Connectez votre dépôt GitHub.
   * Remplissez les paramètres :
     * **Name** : `campus-medias` (ou le nom de votre choix)
     * **Region** : Frankfurt (Europe) ou Oregon
     * **Branch** : `main`
     * **Runtime** : `Node`
     * **Build Command** : `npm install && npm run build`
     * **Start Command** : `npm start`
     * **Instance Type** : `Free`
4. **Variables d'environnement (dans l'onglet *Environment*)** :
   * `NODE_ENV` = `production`
   * `PORT` = `10000`
   * `JWT_SECRET` = (générez une chaîne aléatoire ou laissez Render la générer)
   * `DATABASE_URL` = *(Optionnel si vous connectez une base MySQL TiDB Cloud, voir section 4)*
5. Cliquez sur **Create Web Service**.
6. En 2 à 4 minutes, Render compile le projet et vous fournit une URL publique sécurisée :
   `https://campus-medias.onrender.com`

---

## 3. Option B : Déploiement sur Replit (Le plus rapide)

Si vous ne souhaitez pas utiliser Git ou GitHub, Replit permet d'importer directement votre dossier :

1. Rendez-vous sur [replit.com](https://replit.com) et créez un compte gratuit.
2. Cliquez sur **Create Repl** > **Import from GitHub** ou **Upload Folder** (glissez-déposez le dossier de votre projet).
3. Le fichier de configuration `.replit` déjà présent configure automatiquement l'environnement.
4. Cliquez sur le bouton vert **Run** en haut.
5. Replit installe les dépendances, lance le serveur et vous affiche l'application directement dans une fenêtre web avec une URL dédiée.

---

## 4. Base de données MySQL gratuite avec TiDB Cloud

Si vous souhaitez persister les données réelles (notes, inscriptions réelles, copies d'examen) sur une base de données MySQL cloud permanente sans frais :

1. Créez un compte gratuit sur [tidbcloud.com](https://tidbcloud.com) (aucune carte bancaire requise).
2. Créez un cluster **Serverless (Free)**.
3. Cliquez sur **Connect** > sélectionnez **Node.js** ou **General Connection String**.
4. Copiez l'URL de connexion qui ressemble à :
   ```text
   mysql://<username>:<password>@<gateway-host>:4000/<dbname>?ssl={"rejectUnauthorized":true}
   ```
5. Collez cette valeur dans la variable d'environnement `DATABASE_URL` de votre hébergeur (Render, Replit ou Railway).
6. Dès le premier lancement, l'application crée automatiquement toutes les tables et initialise le programme pédagogique complet.

---

## 5. Variables d'environnement

| Variable | Description | Obligatoire |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode d'exécution (`production` ou `development`) | Oui |
| `PORT` | Port d'écoute HTTP (défaut : `3000` ou `10000` sur Render) | Oui |
| `JWT_SECRET` | Clé secrète de signature des sessions | Oui |
| `DATABASE_URL` | URL de connexion MySQL (TiDB Cloud, Aiven, Railway...) | Optionnel (mode démo intégré si absent) |
| `VITE_OAUTH_PORTAL_URL` | URL du portail OAuth externe (si utilisé) | Optionnel |
