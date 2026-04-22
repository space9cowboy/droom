> **Fichier destiné aux LLMs.**
> 

> À inclure en début de chaque nouvelle fenêtre de contexte pour reprendre le projet sans friction.
> 

> Dernière mise à jour : avril 2026
> 

## 1. Résumé du projet en une phrase

Site web immersif centré sur une chambre virtuelle navigable à 360° (React + Three.js), où chaque objet de la pièce est un portail vers du contenu (musique, gaming, art, cinéma, lecture, mode).

## 2. Documents de référence — lire dans cet ordre

| Priorité | Fichier | Contenu |
| --- | --- | --- |
| 1 | `SPECS_PROJET.md` | Source de vérité complète : vision, stack, zones, interactions, assets, perf, déploiement |
| 2 | `CONTEXT.md` (ce fichier) | État d'avancement, conventions, pièges, workflow LLM |

> **Règle :** toute décision technique ou créative significative doit être reportée dans `SPECS_PROJET.md`.
> 

## 3. Stack technique — résumé rapide

```
Frontend   : React 18 · Vite 5 · TypeScript
3D         : Three.js r160+ · React Three Fiber 8 · @react-three/drei · @react-three/postprocessing
État       : Zustand 4
Audio      : Howler.js 2
Assets 3D  : Blender 4.x → export .glb (Draco + WebP via gltf-transform)
Déploiement: Vercel (CDN + cache headers sur /models et /audio)
```

## 4. État d'avancement

**Date de dernière mise à jour :** avril 2026

**Phase actuelle :** PR-04 Post-processing

| PR | Titre | Statut |
| --- | --- | --- |
| PR-01 | Setup — Init projet | ✅ Done |
| PR-02 | Core 3D — Scène, caméra 360°, room shell | ✅ Done |
| PR-03 | Éclairage & cycle jour/nuit | ✅ Done |
| PR-04 | Post-processing & rendu | ⬜ Non démarrée |
| PR-05 | Système d'interaction hover/clic | ⬜ Non démarrée |
| PR-06 | Zone Musique — MVP | ⬜ Non démarrée |
| PR-07 | UI globale (toggle, loader, audio ambiance) | ⬜ Non démarrée |
| PR-08 | Zones Gaming, Art, Lecture/Tech | ⬜ Non démarrée |
| PR-09 | Zones Cinéma & Mode | ⬜ Non démarrée |
| PR-10 | Performance & optimisation | ⬜ Non démarrée |
| PR-11 | Polish, a11y, E2E, déploiement prod | ⬜ Non démarrée |

## 5. Suivi des tickets

Le Kanban complet (49 tickets) est dans **Notion** :

🔗 [🏠 Chambre Artistique 360° — Kanban](https://www.notion.so/3c072eb426a64eb683c85af2fe851538?pvs=21)

Colonnes : `📋 Backlog` → `🔄 In Progress` → `👀 In Review` → `✅ Done`

## 6. Architecture des fichiers clés

```
/
├── SPECS_PROJET.md
├── CONTEXT.md
├── vite.config.js
├── scripts/blender/
│   └── room_shell.py
├── public/
│   ├── models/
│   │   └── room_shell.glb
│   ├── textures/
│   ├── audio/
│   └── hdri/
│       ├── day.hdr       ← pas encore fourni
│       └── night.hdr     ← pas encore fourni
└── src/
    ├── components/
    │   ├── Scene/         ← Canvas R3F + CameraControls
    │   ├── Room/          ← room_shell.glb loader
    │   ├── DayNightCycle/ ← DayLights, NightLights, SkyBox
    │   ├── zones/
    │   ├── UI/
    │   └── Audio/
    ├── hooks/
    │   ├── useAudio.ts
    │   ├── useDayNight.ts
    │   ├── useInteraction.ts
    │   └── useRoom360.ts
    └── store/
        └── useStore.ts
```

## 7. Conventions du projet

| Élément | Convention | Exemple |
| --- | --- | --- |
| Collections Blender | PascalCase | `TurntableGroup` |
| Meshes | snake_case | `vinyl_disc` |
| Matériaux | préfixe `Mat_` | `Mat_Vinyl` |
| Animations | action explicite | `Disc_Spin_33RPM` |
| Fichiers GLB | `[zone]_[objet].glb` | `music_turntable.glb` |
| Composants React | PascalCase | `<DayLights />` |
| Hooks | `use`  • camelCase | `useDayNight` |

**Format commits :**

```
feat(music-zone): add vinyl disc rotation on play
fix(camera): constrain polar angle to ±70°
3d(music): export music_turntable.glb with Draco
```

Types : `feat` · `fix` · `chore` · `3d` · `ui` · `audio` · `perf` · `docs`

## 8. Règles d'interaction LLM

### En début de session

1. Lire `SPECS_PROJET.md` si la session touche à la vision ou de nouvelles zones
2. Lire la section **4 (État d'avancement)** pour situer la PR en cours
3. Identifier le ou les tickets concernés (IDs T-xxx)

### Pour une session de code

Préciser : ticket ciblé · PR concernée · fichiers à modifier · contraintes spécifiques

### Après chaque session

Mettre à jour : statut ticket Notion · section 4 de ce fichier · SPECS si décision technique

## 9. Pièges et décisions techniques actées

| Sujet | Décision | Raison |
| --- | --- | --- |
| Navigation caméra | Caméra **fixe** au centre, pas de déplacement | UX immersive, focus sur les objets |
| Contrôles caméra | **OrbitControls abandonné** — drag sphérique manuel | Feedback loop instable entre damping et `useFrame priority 1` causait un drift du target |
| Angle vertical | ±70° (minPolar 20°, maxPolar 160°) | Éviter la vue sol/plafond non habillée |
| Normales room_shell | `DoubleSide` sur tous les matériaux GLB | Normales Blender non garanties vers l'intérieur à l'export |
| Format 3D | `.glb` uniquement | Fichier unique, meilleur pour le CDN |
| Compression | Draco géométrie, WebP textures | Meilleur ratio taille/qualité |
| Audio | Howler.js | API simple, formats multiples |
| État global | Zustand | Légèreté, sans boilerplate, compatible R3F |
| Bundler | Vite | SPA statique, DX rapide |
| Déploiement | Vercel SPA | Assets statiques, CDN global |
| HDRI skybox | Swap au seuil 0.5 | Three.js ne peut pas interpoler deux textures equirectangulaires simultanément |
| scene.environment | `null` pour l'instant | Pas de HDR disponibles — reflets PBR reportés à PR-06 |
| Zone prioritaire | Musique (`PR-06`) est le cœur du MVP | Identité musicale = première impression |

## 10. Dépendances critiques entre PRs

```
PR-01 → PR-02 → PR-03 → PR-04 → PR-05 → PR-06 → PR-07
PR-06 à PR-09 parallélisables une fois PR-05 mergée
PR-10 après PR-09 · PR-11 après PR-10
```