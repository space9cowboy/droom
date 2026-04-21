# droom

Site web immersif 360° — chambre virtuelle navigable où chaque objet est un portail vers du contenu.

## Stack

- React 18 + TypeScript + Vite 5
- Three.js r160+, React Three Fiber 8, @react-three/drei, @react-three/postprocessing
- Zustand 4, Howler.js 2

## Développement local (Docker)

```bash
docker compose up
```

L'app est accessible sur http://localhost:5173. Le hot-reload est actif : toute modification dans `src/` se reflète immédiatement dans le navigateur.

## Développement local (sans Docker)

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
```

Les fichiers statiques générés dans `dist/` sont prêts pour un déploiement Vercel.
