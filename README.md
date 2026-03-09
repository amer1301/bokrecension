# Bokrecension
En fullstack-webbapplikation där användare kan hitta böcker, skriva recensioner och interagera med andra läsares aktivitet.
Projektet består av ett React-frontend och ett Node.js/Express-backend med Prisma och SQLite.

---

## Funktioner

- Registrera konto och logga in
- Söka efter böcker
- Skriva och läsa recensioner
- Gilla och kommentera recensioner
- Följa andra användare
- Personligt flöde (feed)
- Hantera lässtatus för böcker
- Notifikationer när andra interagerar

##  Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack React Query
- Axios
- CSS Modules

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- JWT Authentication
- Zod (validering)

## Projektstruktur

```
bokrecension/
│
├── backend/
│   ├── prisma/            # Databasschema och migrationer
│   └── src/
│       ├── middleware/    # Auth och error handling
│       ├── routes/        # API routes
│       ├── services/      # Affärslogik
│       ├── models/        # Datatyper
│       └── index.ts       # Server entry point
│
├── frontend/
│   └── src/
│       ├── api/           # API-anrop
│       ├── components/    # Återanvändbara komponenter
│       ├── pages/         # Applikationens sidor
│       ├── context/       # Auth context
│       └── styles/        # Globala styles
│
└── package.json
```

---

## Installation
Klona repot: 
```bash
git clone <repo-url>
cd bokrecension
```

### Installera dependencies
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

---

## Starta Projektet
```bash
npm run dev
```

---

## Databas
Projektet använder Prisma och SQLite.
För att köra migrationer:
```bash
cd backend
npx prisma migrate deploy
```
Generera Prisma client:
```bash
npx prisma generate
```
## Bygga för produktion
### Backend
```bash
cd backend
npm run build
npm start
```
### Frontend
```bash
cd frontend
npm run build
npm run preview
```
---

## API

Backend exponerar endpoints för bland annat:
- /auth – autentisering
- /reviews – recensioner
- /comments – kommentarer
- /likes – gilla-funktion
- /feed – användarflöde
- /notifications – notifikationer
- /users – användarhantering
- /readingStatus – lässtatus

## Node version

Projektet använder Node 20.
Om du använder nvm:
```bash
nvm use
```

## Publicering
https://bokrecension-frontend.onrender.com/
