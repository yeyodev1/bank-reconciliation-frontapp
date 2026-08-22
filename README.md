# conciliacion-frontapp

Pantallas de conciliación bancaria. Vue 3 + Vite + Pinia + SCSS.

```bash
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8100/api
pnpm install
pnpm dev                 # http://localhost:5173
pnpm build
```

Flujo: **Cuentas** → **1 · Excel del BANCO** → **2 · Excel del SISTEMA** → **3 · Conciliación del mes**
(guardar corrida, cerrar, reabrir). Reglas de UI/UX en `../.claude/agents/frontend.md`.
