"""
room_shell.py
Génère public/models/room_shell.glb de façon entièrement procédurale (bpy).

Exécution :
    blender --background --python scripts/blender/room_shell.py

Compression Draco post-export (optionnel, nécessite @gltf-transform/cli) :
    npx gltf-transform draco public/models/room_shell.glb public/models/room_shell.glb

Système de coordonnées :
    Blender (Z-up)  →  glTF / Three.js (Y-up)
      Blender X     →  Three.js  X   (inchangé)
      Blender Y     →  Three.js −Z   (inversé)
      Blender Z     →  Three.js  Y

    Orientation chambre (Three.js) :
      • Nord  = Z négatif  (baie vitrée — Blender Y = +3)
      • Sud   = Z positif  (Blender Y = −3)
      • Est   = X positif  (Blender X = +4)
      • Ouest = X négatif  (Blender X = −4)
      • Caméra : (0, 1.6, 0) Three.js → (0, 0, 1.6) Blender
"""

import bpy
import bmesh
import os
from mathutils import Vector

# ---------------------------------------------------------------------------
# Chemins
# ---------------------------------------------------------------------------
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUTPUT_PATH  = os.path.join(PROJECT_ROOT, "public", "models", "room_shell.glb")

# ---------------------------------------------------------------------------
# Dimensions de la chambre (Blender Z-up)
# ---------------------------------------------------------------------------
ROOM_W = 8.0    # axe X  : −4 … +4
ROOM_D = 6.0    # axe Y  : −3 … +3  (→ Z ±3 en Three.js)
ROOM_H = 3.0    # axe Z  : 0 … 3    (→ Y 0…3  en Three.js)

# Baie vitrée (mur Nord, Blender Y = +3)
WIN_W  = 5.0                        # largeur ouverture (X)
WIN_H  = 2.2                        # hauteur ouverture (Z Blender = Y Three.js)
WIN_Z0 = (ROOM_H - WIN_H) / 2      # bas ouverture  ≈ 0.4 m (allège)
WIN_Z1 = WIN_Z0 + WIN_H             # haut ouverture ≈ 2.6 m
WIN_X0 = -WIN_W / 2                 # −2.5
WIN_X1 =  WIN_W / 2                 # +2.5

COLLECTION_NAME = "RoomShell"

# ---------------------------------------------------------------------------
# 1. Nettoyage de la scène
# ---------------------------------------------------------------------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)
for block in (bpy.data.meshes, bpy.data.materials, bpy.data.objects):
    for item in list(block):
        block.remove(item)

# ---------------------------------------------------------------------------
# 2. Collection RoomShell
# ---------------------------------------------------------------------------
collection = bpy.data.collections.new(COLLECTION_NAME)
bpy.context.scene.collection.children.link(collection)

# ---------------------------------------------------------------------------
# 3. Matériaux
# ---------------------------------------------------------------------------
def make_material(name: str, color=(0.8, 0.8, 0.8, 1.0)):
    """Crée un matériau Principled BSDF avec la couleur de base donnée."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
    return mat

mat_floor   = make_material("Mat_Floor",   color=(0.55, 0.50, 0.45, 1.0))
mat_ceiling = make_material("Mat_Ceiling", color=(0.95, 0.95, 0.92, 1.0))
mat_wall    = make_material("Mat_Wall",    color=(0.82, 0.79, 0.74, 1.0))

# ---------------------------------------------------------------------------
# 4. Fonction utilitaire : créer un objet mesh + UVs
# ---------------------------------------------------------------------------
def make_mesh_object(name: str, verts: list, faces: list, material):
    """
    Crée un objet mesh dans la collection, assigne les faces et génère
    des UV par projection planaire axiale.

    verts  : liste de tuples (x, y, z) — coords Blender
    faces  : liste de tuples d'indices, winding CCW = normale vers le
             spectateur (toutes les normales pointent vers l'intérieur)
    """
    mesh = bpy.data.meshes.new(name)
    obj  = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)

    bm = bmesh.new()

    bm_verts = [bm.verts.new(v) for v in verts]
    bm.verts.ensure_lookup_table()

    for face_idx in faces:
        bm.faces.new([bm_verts[i] for i in face_idx])
    bm.faces.ensure_lookup_table()

    # Mise à jour des normales bmesh avant la projection UV
    bm.normal_update()

    # Projection UV planaire axiale par face
    uv_layer = bm.loops.layers.uv.new("UVMap")
    for face in bm.faces:
        n  = face.normal
        ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
        for loop in face.loops:
            co = loop.vert.co
            if az >= ax and az >= ay:
                # Sol / plafond → projection XY
                u = co.x / ROOM_W + 0.5
                v = co.y / ROOM_D + 0.5
            elif ay >= ax:
                # Murs Nord / Sud → projection XZ
                u = co.x / ROOM_W + 0.5
                v = co.z / ROOM_H
            else:
                # Murs Est / Ouest → projection YZ
                u = co.y / ROOM_D + 0.5
                v = co.z / ROOM_H
            loop[uv_layer].uv = (u, v)

    bm.to_mesh(mesh)
    bm.free()

    mesh.validate()
    mesh.update()

    mesh.materials.append(material)
    return obj

# ---------------------------------------------------------------------------
# 5. Sol  (Blender Z = 0 → Three.js Y = 0)
#    Normale +Z Blender = +Y Three.js (pointe vers le haut, vers l'intérieur)
#    Winding CCW vu de dessus (+Z) :
#       (−4,−3,0) → (+4,−3,0) → (+4,+3,0) → (−4,+3,0)
# ---------------------------------------------------------------------------
make_mesh_object(
    "room_floor",
    verts=[
        (-4.0, -3.0, 0.0),  # 0 : avant-gauche
        ( 4.0, -3.0, 0.0),  # 1 : avant-droit
        ( 4.0,  3.0, 0.0),  # 2 : arrière-droit
        (-4.0,  3.0, 0.0),  # 3 : arrière-gauche
    ],
    faces=[(0, 1, 2, 3)],
    material=mat_floor,
)

# ---------------------------------------------------------------------------
# 6. Plafond  (Blender Z = 3 → Three.js Y = 3)
#    Normale −Z Blender = −Y Three.js (pointe vers le bas, vers l'intérieur)
#    Winding CCW vu de dessous (−Z) :
#       (−4,+3,3) → (+4,+3,3) → (+4,−3,3) → (−4,−3,3)
# ---------------------------------------------------------------------------
make_mesh_object(
    "room_ceiling",
    verts=[
        (-4.0,  3.0, 3.0),  # 0
        ( 4.0,  3.0, 3.0),  # 1
        ( 4.0, -3.0, 3.0),  # 2
        (-4.0, -3.0, 3.0),  # 3
    ],
    faces=[(0, 1, 2, 3)],
    material=mat_ceiling,
)

# ---------------------------------------------------------------------------
# 7. Mur Sud  (Blender Y = −3 → Three.js Z = +3)
#    Normale +Y Blender = −Z Three.js (pointe vers le centre de la pièce)
#    Winding CCW vu du +Y :
#       (−4,−3,3) → (+4,−3,3) → (+4,−3,0) → (−4,−3,0)
# ---------------------------------------------------------------------------
make_mesh_object(
    "room_wall_south",
    verts=[
        (-4.0, -3.0, 3.0),  # 0 : haut-gauche
        ( 4.0, -3.0, 3.0),  # 1 : haut-droit
        ( 4.0, -3.0, 0.0),  # 2 : bas-droit
        (-4.0, -3.0, 0.0),  # 3 : bas-gauche
    ],
    faces=[(0, 1, 2, 3)],
    material=mat_wall,
)

# ---------------------------------------------------------------------------
# 8. Mur Est  (Blender X = +4 → Three.js X = +4)
#    Normale −X (pointe vers le centre de la pièce)
#    Winding CCW vu du −X :
#       (+4,+3,0) → (+4,−3,0) → (+4,−3,3) → (+4,+3,3)
# ---------------------------------------------------------------------------
make_mesh_object(
    "room_wall_east",
    verts=[
        (4.0,  3.0, 0.0),  # 0 : bas-arrière
        (4.0, -3.0, 0.0),  # 1 : bas-avant
        (4.0, -3.0, 3.0),  # 2 : haut-avant
        (4.0,  3.0, 3.0),  # 3 : haut-arrière
    ],
    faces=[(0, 1, 2, 3)],
    material=mat_wall,
)

# ---------------------------------------------------------------------------
# 9. Mur Ouest  (Blender X = −4 → Three.js X = −4)
#    Normale +X (pointe vers le centre de la pièce)
#    Winding CCW vu du +X :
#       (−4,−3,0) → (−4,+3,0) → (−4,+3,3) → (−4,−3,3)
# ---------------------------------------------------------------------------
make_mesh_object(
    "room_wall_west",
    verts=[
        (-4.0, -3.0, 0.0),  # 0 : bas-avant
        (-4.0,  3.0, 0.0),  # 1 : bas-arrière
        (-4.0,  3.0, 3.0),  # 2 : haut-arrière
        (-4.0, -3.0, 3.0),  # 3 : haut-avant
    ],
    faces=[(0, 1, 2, 3)],
    material=mat_wall,
)

# ---------------------------------------------------------------------------
# 10. Mur Nord avec baie vitrée  (Blender Y = +3 → Three.js Z = −3)
#     Normale −Y Blender = +Z Three.js (pointe vers l'intérieur depuis le Nord)
#
#     Grille de sommets (vue de l'intérieur, X vers la droite, Z vers le haut) :
#
#     12 ─────── 13 ─────────── 14 ─────── 15   ← Z = 3.0 (plafond)
#      │  top-L  │   top-center │  top-R   │
#      8 ──────── 9             10 ─────── 11   ← Z = WIN_Z1 ≈ 2.6
#      │  L-mont │  [OUVERTURE] │  R-mont  │
#      4 ──────── 5             6 ───────── 7   ← Z = WIN_Z0 ≈ 0.4 (allège)
#      │  bot-L  │   bot-center │  bot-R   │
#      0 ─────── 1 ─────────── 2 ──────── 3    ← Z = 0.0  (sol)
#      X=−4    X=−2.5        X=+2.5     X=+4
#
#     Winding CCW vu de l'intérieur (vu du −Y) pour chaque quad
# ---------------------------------------------------------------------------
x0, x1, x2, x3 = -4.0, WIN_X0, WIN_X1, 4.0
z0, z1, z2, z3 =  0.0, WIN_Z0, WIN_Z1, ROOM_H
yn = 3.0  # coordonnée Y Blender du mur Nord

north_verts = [
    # Rangée bas (Z = sol)
    (x0, yn, z0),   # 0
    (x1, yn, z0),   # 1
    (x2, yn, z0),   # 2
    (x3, yn, z0),   # 3
    # Rangée allège (Z = WIN_Z0)
    (x0, yn, z1),   # 4
    (x1, yn, z1),   # 5
    (x2, yn, z1),   # 6
    (x3, yn, z1),   # 7
    # Rangée linteau (Z = WIN_Z1)
    (x0, yn, z2),   # 8
    (x1, yn, z2),   # 9
    (x2, yn, z2),   # 10
    (x3, yn, z2),   # 11
    # Rangée haut (Z = plafond)
    (x0, yn, z3),   # 12
    (x1, yn, z3),   # 13
    (x2, yn, z3),   # 14
    (x3, yn, z3),   # 15
]

north_faces = [
    # Bande inférieure — allège (3 quads)
    (0, 1, 5, 4),    # allège gauche
    (1, 2, 6, 5),    # allège centre
    (2, 3, 7, 6),    # allège droite
    # Bande médiane — montants (ouverture au centre, pas de face)
    (4, 5, 9, 8),    # montant gauche
    (6, 7, 11, 10),  # montant droit
    # Bande supérieure — linteau + mur haut (3 quads)
    (8,  9,  13, 12),  # haut gauche
    (9,  10, 14, 13),  # haut centre
    (10, 11, 15, 14),  # haut droite
]

make_mesh_object("room_wall_north", north_verts, north_faces, mat_wall)

# ---------------------------------------------------------------------------
# 11. Export GLB
#     export_yup=True : convertit Blender Z-up → Y-up (standard glTF 2.0)
#     export_normals=True : normales explicites → pas d'artefacts dans Three.js
# ---------------------------------------------------------------------------
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    export_yup=True,
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT',
    export_normals=True,
    export_texcoords=True,
)

print(f"\n✓  room_shell.glb → {OUTPUT_PATH}")
print(f"   Ouverture baie vitrée : X [{WIN_X0}…{WIN_X1}] | Z [{WIN_Z0:.2f}…{WIN_Z1:.2f}]\n")
