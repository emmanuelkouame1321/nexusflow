# NexusFlow

**ERP / CRM full‑stack** conçu pour les PME et startups.  
Centralisez la gestion de vos clients, devis, factures, projets et tâches en une seule application web rapide, moderne et sécurisée.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)
![Prisma](https://img.shields.io/badge/prisma-6.x-2D3748?logo=prisma)
![React](https://img.shields.io/badge/react-18.x-61DAFB?logo=react)

---

## Fonctionnalités

- **CRM** – Gestion des clients et contacts, pipeline commercial (kanban)
- **Devis & Facturation** – Création de devis avec lignes dynamiques, conversion en facture, suivi des paiements
- **Projets & Tâches** – Kanban, calendrier, dépendances, commentaires en temps réel
- **Tableaux de bord** – KPIs personnalisables, graphiques, exports CSV/PDF
- **Authentification sécurisée** – JWT (access + refresh tokens), cookies httpOnly, contrôle d’accès par rôles (RBAC)
- **API REST** – Prête pour une intégration frontale ou mobile, documentée et versionnée

---

## Stack technique

| Couche           | Technologie                  |
| ---------------- | ---------------------------- |
| Frontend         | React 18, Vite, Tailwind CSS |
| Backend          | Node.js, Express             |
| Base de données  | PostgreSQL (Neon ou locale)  |
| ORM              | Prisma 6                     |
| Authentification | JWT + cookies httpOnly       |
| Temps réel       | Socket.io                    |
| Emails / PDF     | Nodemailer, Puppeteer        |

---

## Structure du monorepo

```

nexusflow/
├── packages/
│ ├── server/ ← API Express + Prisma
│ ├── client/ ← Frontend React + Vite
│ └── shared/ ← Constantes, validateurs Joi
├── database/ ← Scripts SQL additionnels
├── package.json ← Workspaces npm
└── …

```

---

## Prérequis

- **Node.js** ≥ 20 LTS
- **npm** ≥ 10
- **PostgreSQL** (local ou [Neon](https://neon.tech))
- **Git**

---

## Démarrage rapide

### 1. Cloner le dépôt

```bash
git clone git@github.com:emmanuelkouame1321/nexusflow.git
cd nexusflow
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l’environnement

Copiez le fichier d’exemple et renseignez les variables nécessaires :

```bash
cp .env.example .env
```

Variables indispensables : `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SMTP_*`.

### 4. Initialiser la base de données

```bash
npm -w @nexusflow/server run prisma:migrate -- --name init
npm -w @nexusflow/server run prisma:seed
```

### 5. Lancer le serveur et le client

```bash
npm run dev
```

- API : [http://localhost:5000](http://localhost:5000)
- Frontend : [http://localhost:3000](http://localhost:3000)

---

## Scripts utiles

| Commande                                      | Description                                |
| --------------------------------------------- | ------------------------------------------ |
| `npm run dev`                                 | Lance serveur + client en parallèle        |
| `npm -w @nexusflow/server run prisma:studio`  | Interface graphique Prisma                 |
| `npm -w @nexusflow/server run prisma:migrate` | Créer une migration                        |
| `npm -w @nexusflow/server run prisma:seed`    | Remplir la base avec les données initiales |
| `npm run lint`                                | Vérifier le code avec ESLint               |
| `npm run format`                              | Formater le code avec Prettier             |

---

## Déploiement

La procédure de déploiement sur **DigitalOcean** (Droplet, Nginx, PM2) sera documentée dans le dossier `docs/`.

---

## Contribution

Les contributions sont les bienvenues ! Consultez le [guide de contribution](./CONTRIBUTING.md) avant d’ouvrir une pull request.

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE).
