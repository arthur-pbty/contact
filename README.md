# Contact ArthurP

Page de contact centralisee pour les projets ArthurP avec stockage PostgreSQL et espace admin.

Site officiel: `https://contact.arthurp.fr`

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- API route `app/api/contact/route.ts`
- Validation partagee avec Zod
- PostgreSQL (stockage des messages)
- Notifications via Nodemailer et Discord webhook (optionnel)
- Dashboard admin avec authentification par cookie de session

## Sites supportes

- arthurp.fr
- links.arthurp.fr
- qcu.arthurp.fr
- qrcode.arthurp.fr
- lazybot.arthurp.fr
- learn.arthurp.fr
- sudoku.arthurp.fr
- reducelink.arthurp.fr
- clock.arthurp.fr
- form.arthurp.fr
- pomodoro.arthurp.fr
- visio.arthurp.fr
- doudou.arthurp.fr
- portfolio.arthurp.fr
- moon.arthurp.fr
- calculatrice.arthurp.fr
- chrono.arthurp.fr
- blocnote.arthurp.fr
- imprimersudoku.arthurp.fr

## Variables d'environnement

Copier `.env.example` vers `.env` puis completer:

```bash
cp .env.example .env
```

Variables principales:

- `CONTACT_TO_EMAIL` adresse recevant les messages
- `CONTACT_FROM_EMAIL` expediteur technique
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` pour l'envoi email
- `DISCORD_WEBHOOK_URL` (optionnel)
- `DATABASE_URL` URL PostgreSQL
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` credentials admin
- `ADMIN_SESSION_SECRET` secret de signature de session admin

## Lancement en local

```bash
npm install
npm run dev
```

Accessible sur `http://localhost:3000`.

Dashboard admin: `http://localhost:3000/admin`

Exemples de liens:

- `http://localhost:3000?project=lazybot`
- `http://localhost:3000?project=qrcode`

## Docker

Le projet fournit un Dockerfile multi-stage + Compose avec profils `dev` et `prod`.

### Developpement (hot reload + PostgreSQL)

```bash
docker compose --profile dev up --build
```

### Production (app + PostgreSQL)

```bash
docker compose --profile prod up --build -d
```

Le build production utilise `output: "standalone"` pour une image plus propre et legere.

## Pages legales

- `/mentions-legales`
- `/politique-confidentialite`
- `/cgu`
- `/cookies`

## Verification qualite

```bash
npm run lint
npm run build
```

## Securite deja en place

- Validation client + serveur
- Honeypot anti-spam
- Limitation de requetes basique par IP
- Secrets conserves via variables d'environnement
- Session admin en cookie HttpOnly
