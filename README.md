OZSUITE Frontend (Next.js + Tailwind)

Scripts:
- dev: `npm run dev` → http://localhost:5173
- build: `npm run build`
- start: `npm run start`

Backend proxy:
- Configurado en `next.config.js` con rewrites: `/api/*` → `API_URL` (por defecto `http://localhost:8080`).
- Para cambiarlo, establece `API_URL` en `.env.local`.

Estructura:
- `app/` router: landing en `/`, aplicación en `/app/*` (dashboard, signup, quotes, projects...).
- `components/`: Header, Sidebar, Footer, ThemeLoader.
- `public/assets/`: `logo.svg` y `colors.json` (variables del tema).

Tema:
- Variables CSS en `app/globals.css`.
- `ThemeLoader` carga `public/assets/colors.json` y aplica variables.
