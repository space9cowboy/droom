> Source de vérité complète du projet.
> 

> Dernière mise à jour : avril 2026
> 

> Stack : React · Three.js · React Three Fiber · Blender · Vercel
> 

## 1. Vision générale

Site web immersif centré sur une **chambre virtuelle navigable à 360°**. La chambre est le reflet d'une personnalité multiple : musicien, gamer, lecteur, cinéphile, artiste visuel, passionné de tech et de mode. Chaque coin de la pièce représente un centre d'intérêt et sert de portail vers du contenu.

Le visiteur arrive dans la chambre et tourne librement la vue. Il n'y a pas de menu — les objets sont le menu.

### Objectif pour le visiteur

- **Qui je suis** — identité, univers visuel, influences
- **Écouter ma musique** — lecteur intégré, albums, liens streaming
- **Mon univers créatif** — tout ce qui constitue l'artiste

### Ambiance

Chambre de créateur contemporain. Mélange de styles : textures naturelles (bois, béton, tissu) + éléments tech et pop culture. La **baie vitrée** est l'élément architectural central.

## 2. Stack technique

| Technologie | Rôle |
| --- | --- |
| React 18 | Framework UI |
| Three.js r160+ | Moteur 3D WebGL |
| React Three Fiber 8 | Binding React/Three.js |
| @react-three/drei | Helpers R3F |
| @react-three/postprocessing | Effets post-traitement |
| Zustand 4 | État global |
| Howler.js 2 | Lecteur audio |
| Vite 5 | Bundler |
| Vercel | Déploiement / CDN |
| Blender 4.x | Modélisation 3D |
| gltf-transform | Draco + WebP |

## 3. Scène principale — Chambre 360°

### Navigation caméra

Caméra **fixe au centre** (0, 1.6, 0). 360° horizontal, ±70° vertical. Pas de déplacement ni zoom.

**Implémentation :** drag sphérique manuel (OrbitControls abandonné — voir section décisions).

### Plan de la chambre (8m × 6m)

```
           NORD — Baie vitrée (Z négatif)
┌────────────────────────────────────┐
│  [Coin MUSIQUE]    [Coin ART/DESSIN]  │
│  Platine           Chevalet           │
│       👁 CAM (centre)               │
│  [Coin GAMING]     [Coin LECTURE/TECH]│
│  Setup PC          Bureau + livres    │
└────────────────────────────────────┘
           SUD — Penderie / mode
```

### Les 6 zones

| Zone | Direction | Action au clic |
| --- | --- | --- |
| Musique | Nord-Ouest | Lecture audio, albums |
| Art / Dessin | Nord-Est | Galerie d'œuvres |
| Gaming | Sud-Ouest | Section gaming |
| Lecture / Tech | Sud-Est | Projets tech |
| Cinéma | Est | Films favoris |
| Mode / Streetwear | Sud | Style / inspirations |
| Baie vitrée | Nord | Toggle jour/nuit |

## 4. Système jour / nuit

### Mode Jour

- `HemisphereLight` sky `#87CEEB` ground `#8B7355` intensity `0.4`
- `DirectionalLight` `#FFF5E0` intensity `2.5` golden hour, shadows 2048²
- `RectAreaLight` `#B8D4FF` intensity `4` baie vitrée Nord

### Mode Nuit

- `HemisphereLight` intensity `0.1`
- `PointLight` lampe bureau `#FFD084` intensity `3`
- `PointLight` écrans `#8AB4F8` intensity `1`
- `SpotLight` LED `#FF6B9D` intensity `2`

### Transition

Interpolation douce 2s via `useDayNight` hook — `progressRef` 0→1, lerp `delta/2` dans `useFrame`. Zéro re-render React.

## 5. Interactions utilisateur

1. **Hover** — emissive +0.15, curseur pointer, tooltip
2. **Clic** — action spécifique (audio, galerie, panel)

## 6. Audio

- Howler.js · formats `.mp3` + `.ogg`
- Effet vinyle crackle pendant rotation disque
- Ambiance sonore jour/nuit
- Sons d'interaction hover/clic

## 7. UI

| Élément | Position |
| --- | --- |
| Toggle jour/nuit | Coin haut-droit |
| Lecteur audio mini | Bas centre |
| Tooltip objet | Près du curseur |
| Panel contenu | Overlay centré |
| Loader initial | Plein écran |

## 8. Rendu & post-processing

| Effet | Jour | Nuit |
| --- | --- | --- |
| Bloom | 0.3 | 0.6 |
| Grain | 0.03 | 0.10 |
| Vignette | 0.3 | 0.5 |
| Tone mapping | ACESFilmic | ACESFilmic |

## 9. Assets Blender

### Conventions

- Collections : `PascalCase` · Meshes : `snake_case` · Matériaux : `Mat_` · GLB : `[zone]_[objet].glb`

### Priorité 1 — MVP

| Fichier | Zone | Statut |
| --- | --- | --- |
| `room_shell.glb` | — | ✅ Done |
| `music_vinyl_disc.glb` | Musique | ✅ Script généré |
| `music_turntable.glb` | Musique | À faire |
| `music_shelf.glb` | Musique | À faire |

## 10. Performance

| Métrique | Cible |
| --- | --- |
| FPS desktop | 60 fps |
| FPS mobile | 30 fps |
| Taille GLB MVP | < 8 MB |
| FCP | < 2s |
| TTI | < 5s |

## 11. Décisions techniques actées

| Sujet | Décision | Raison |
| --- | --- | --- |
| Contrôles caméra | Drag sphérique manuel | OrbitControls : feedback loop damping + useFrame causait drift |
| Normales GLB | `DoubleSide` | Normales Blender non garanties à l'export |
| HDRI skybox | Swap au seuil 0.5 | Pas de lerp entre deux textures equirect |
| scene.environment | `null` pour l'instant | HDR non fournis, reflets PBR reportés PR-06 |
| Format 3D | `.glb` uniquement | Fichier unique, CDN optimal |
| Compression | Draco + WebP | Meilleur ratio taille/qualité |
| Bundler | Vite | SPA statique, compatible R3F |
| Déploiement | Vercel SPA | Assets statiques, CDN global |