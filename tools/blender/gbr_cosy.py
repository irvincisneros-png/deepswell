# DeepSwell – cosy-style Great Barrier Reef asset set, built headless in Blender and exported as glTF (.glb).
# Run:  blender --background --factory-startup --python tools/blender/gbr_cosy.py -- <out.glb> [preview.png]
# Style: chunky, rounded, matte, pastel (soft "diorama" look). Colours are vertex colours (no textures),
# so files stay small and species markings stay crisp. Model axes: +X forward (fish head), +Z up in Blender
# (glTF export converts to three.js +Y up).
import bpy, bmesh, math, random, sys
from mathutils import Vector, noise, Color

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else 'gbr_cosy.glb'
PREVIEW = argv[1] if len(argv) > 1 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def srgb(h):
    c = Color(); c.r, c.g, c.b = [((h >> s) & 255) / 255 for s in (16, 8, 0)]
    return (c.r, c.g, c.b)

def lin(c):  # sRGB -> linear for FLOAT colour attributes
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

def vcolor(obj, fn):
    """Point colour attribute from fn(co, normal) -> sRGB tuple."""
    me = obj.data
    attr = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    for v in me.vertices:
        r, g, b = lin(fn(v.co, v.normal))
        attr.data[v.index].color = (r, g, b, 1.0)
    me.color_attributes.active_color = attr
    me.color_attributes.render_color_index = 0

def finish(obj, name, smooth=True):
    obj.name = name; obj.data.name = name
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    mat = bpy.data.materials.get('VC') or make_vc_material()
    obj.data.materials.clear(); obj.data.materials.append(mat)
    return obj

def make_vc_material():
    m = bpy.data.materials.new('VC'); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Col'
    nt.links.new(a.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.85
    return m

def apply_all(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

def metaball_mesh(name, elems, resolution=0.06, threshold=0.6):
    """elems: list of (co, radius). Returns a smooth blobby mesh object."""
    mb = bpy.data.metaballs.new(name + '_mb'); mb.resolution = resolution; mb.render_resolution = resolution; mb.threshold = threshold
    o = bpy.data.objects.new(name + '_mbo', mb); scene.collection.objects.link(o)
    for co, r in elems:
        e = mb.elements.new(); e.co = co; e.radius = r
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    m = bpy.context.view_layer.objects.active
    bpy.ops.object.select_all(action='DESELECT')
    return m

def remove_islands(obj, keep_ratio=0.04):
    """Delete tiny disconnected metaball fragments (keep pieces with at least keep_ratio of the vertices)."""
    bm = bmesh.new(); bm.from_mesh(obj.data); bm.verts.ensure_lookup_table()
    seen, groups = set(), []
    for v in bm.verts:
        if v.index in seen: continue
        stack, g = [v], []
        seen.add(v.index)
        while stack:
            a = stack.pop(); g.append(a)
            for e in a.link_edges:
                b = e.other_vert(a)
                if b.index not in seen: seen.add(b.index); stack.append(b)
        groups.append(g)
    n = len(bm.verts)
    bmesh.ops.delete(bm, geom=[v for g in groups if len(g) < n * keep_ratio for v in g], context='VERTS')
    bm.to_mesh(obj.data); bm.free()

def decimate(obj, ratio):
    d = obj.modifiers.new('dec', 'DECIMATE'); d.ratio = ratio; apply_all(obj)

def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)

def mix(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))

made = []

# ---------------------------------------------------------------- rocks: smooth pebbles
for i, (sx, sy, sz, seed) in enumerate([(1.0, 0.8, 0.55, 1), (0.8, 0.7, 0.7, 2), (1.2, 0.9, 0.45, 3)]):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=0.5)
    o = bpy.context.active_object
    for v in o.data.vertices:
        p = v.co.copy()
        d = noise.noise(p * 1.6 + Vector((seed * 3.1, 0, 0))) * 0.12 + noise.noise(p * 3.5 + Vector((0, seed, 0))) * 0.03
        v.co = p * (1 + d)
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
        v.co.z = max(v.co.z, -0.12)  # flat-ish base
    o.data.update()
    top, base = srgb(0xb9c6cc), srgb(0x7f8f99)
    vcolor(o, lambda co, n: mix(base, top, smoothstep(-0.4, 0.8, n.z)))
    made.append(finish(o, f'rock_{i}'))

# ---------------------------------------------------------------- staghorn: chunky branching blobs
def staghorn(name, seed, base, tip):
    rnd = random.Random(seed)
    elems, tips = [], []
    def grow(p, d, length, r, depth):
        steps = max(2, int(length / (r * 0.7)))
        for s in range(1, steps + 1):
            q = p + d * (length * s / steps)
            elems.append((q, r * (1 - 0.15 * s / steps)))
        end = p + d * length
        if depth == 0: tips.append(end); return
        for k in range(2 if depth > 1 else rnd.choice([1, 2])):
            nd = (d + Vector((rnd.uniform(-0.9, 0.9), rnd.uniform(-0.9, 0.9), rnd.uniform(0.1, 0.6)))).normalized()
            grow(end, nd, length * rnd.uniform(0.65, 0.85), r * 0.88, depth - 1)
    for s in range(5):
        a = s / 5 * math.tau + rnd.uniform(0, 0.6)
        grow(Vector((math.cos(a) * 0.08, math.sin(a) * 0.08, 0)), Vector((math.cos(a) * 0.5, math.sin(a) * 0.5, 1)).normalized(), 0.3, 0.11, 3)
    o = metaball_mesh(name, elems, resolution=0.04, threshold=0.5)
    remove_islands(o)
    decimate(o, 0.55)
    zmax = max(v.co.z for v in o.data.vertices)
    vcolor(o, lambda co, n: mix(base, tip, smoothstep(0.25, 1.0, co.z / zmax) ** 1.3))
    return finish(o, name)
made.append(staghorn('staghorn_0', 7, srgb(0x8a6fb3), srgb(0xf3b5d8)))   # lavender with pink tips
made.append(staghorn('staghorn_1', 11, srgb(0x5e9e86), srgb(0xd8f0a0)))   # sea green with lime tips
made.append(staghorn('staghorn_2', 19, srgb(0x6f88c8), srgb(0xb8e4ff)))   # blue with pale tips

# ---------------------------------------------------------------- brain coral: dome with soft meandering grooves
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.5)
o = bpy.context.active_object
for v in o.data.vertices:
    p = v.co.copy()
    w = p * 6 + Vector((noise.noise(p * 2) * 2.5, noise.noise(p * 2 + Vector((5, 0, 0))) * 2.5, 0))
    g = math.sin(w.x + math.sin(w.y * 0.8) * 1.6)
    p *= 1 + 0.07 * g
    p.z = p.z * 0.72 if p.z > 0 else p.z * 0.15
    v.co = p
o.data.update()
ridge, groove = srgb(0xc9d98a), srgb(0x6f8f5a)
vcolor(o, lambda co, n: mix(groove, ridge, smoothstep(-0.3, 0.6, (co.length - 0.5 * (0.72 if co.z > 0 else 0.15) * 0) * 0 + math.sin((co * 6 + Vector((noise.noise(co * 2 / 1.0) * 2.5, noise.noise(co * 2 + Vector((5, 0, 0))) * 2.5, 0))).x + math.sin((co * 6).y * 0.8) * 1.6))))
made.append(finish(o, 'brain_0'))

# ---------------------------------------------------------------- table coral: rounded plate on a stalk, pale rim
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.75, depth=0.12)
o = bpy.context.active_object
bev = o.modifiers.new('bev', 'BEVEL'); bev.width = 0.05; bev.segments = 4
sub = o.modifiers.new('sub', 'SUBSURF'); sub.levels = 1
apply_all(o)
for v in o.data.vertices:
    r = math.hypot(v.co.x, v.co.y)
    v.co.z += 0.42 + 0.08 * (r / 0.75) ** 2 + noise.noise(v.co * 3) * 0.02
o.data.update()
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.1, depth=0.42, location=(0, 0, 0.21))
st = bpy.context.active_object
bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); st.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.join()
plate, rim, stalk = srgb(0x7fb8a8), srgb(0xf0e6b8), srgb(0x8c8a78)
vcolor(o, lambda co, n: stalk if co.z < 0.36 else mix(plate, rim, smoothstep(0.55, 0.78, math.hypot(co.x, co.y))))
made.append(finish(o, 'table_0'))

# ---------------------------------------------------------------- soft coral clumps: bubbly pastel bunches
def bubbles(name, seed, cols):
    rnd = random.Random(seed)
    elems, centres = [], []
    for k in range(14):
        a, r = rnd.uniform(0, math.tau), rnd.uniform(0, 0.35)
        c = Vector((math.cos(a) * r, math.sin(a) * r, rnd.uniform(0.08, 0.45) * (1 - r)))
        rad = rnd.uniform(0.09, 0.16)
        elems.append((c, rad)); centres.append((c, cols[k % len(cols)]))
    o = metaball_mesh(name, elems, resolution=0.03, threshold=0.5)
    decimate(o, 0.4)
    def col(co, n):
        best = min(centres, key=lambda e: (co - e[0]).length)
        return mix(best[1], (1, 1, 1), 0.12 * max(0, n.z))
    vcolor(o, col)
    return finish(o, name)
made.append(bubbles('softcoral_0', 3, [srgb(0xb48ee0), srgb(0xd9a3e8), srgb(0x8f7fd6)]))
made.append(bubbles('softcoral_1', 5, [srgb(0xf2a0b8), srgb(0xffd27a), srgb(0xf6b0c8)]))

# ---------------------------------------------------------------- fish: smooth chunky bodies, big friendly eyes
def fish_body(name, L, depth, width, prof_peak=0.55):
    """Lofted body along +X (tail at -L/2). Returns object; fins added separately."""
    bm = bmesh.new()
    rings, seg = 20, 16
    verts = []
    for i in range(rings + 1):
        t = i / rings
        x = -L / 2 + t * L
        a = math.log(0.5) / math.log(prof_peak)
        prof = math.sin(math.pi * min(0.999, t) ** a) ** 0.75
        prof = 0.16 + 0.84 * prof
        if t > 0.96: prof *= math.sqrt(max(0, (1 - t) / 0.04)) * 0.6 + 0.4
        row = []
        for s in range(seg):
            ph = s / seg * math.tau
            row.append(bm.verts.new((x, math.sin(ph) * width / 2 * prof, math.cos(ph) * depth / 2 * prof)))
        verts.append(row)
    for i in range(rings):
        for s in range(seg):
            bm.faces.new((verts[i][s], verts[i][(s + 1) % seg], verts[i + 1][(s + 1) % seg], verts[i + 1][s]))
    bm.faces.new(list(reversed(verts[0]))); bm.faces.new(verts[-1])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); scene.collection.objects.link(o)
    sub = o.modifiers.new('sub', 'SUBSURF'); sub.levels = 1
    bpy.context.view_layer.objects.active = o; apply_all(o)
    return o

def fin(outline, thick=0.012):
    """Flat rounded fin from a 2D outline in the XZ plane (y = 0), solidified and smoothed."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, 0, z)) for x, z in outline]
    bm.faces.new(vs)
    me = bpy.data.meshes.new('fin'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('fin', me); scene.collection.objects.link(o)
    so = o.modifiers.new('so', 'SOLIDIFY'); so.thickness = thick; so.offset = 0
    sub = o.modifiers.new('sub', 'SUBSURF'); sub.levels = 1
    bpy.context.view_layer.objects.active = o; apply_all(o)
    return o

def eyes(x, z, y, r):
    out = []
    for side in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=r, location=(x, side * y, z)); out.append(bpy.context.active_object)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=r * 0.35, location=(x + r * 0.35, side * (y + r * 0.7), z + r * 0.35)); out.append(bpy.context.active_object)
    return out

def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; o.name = name
    return o

# Blue tang (Paracanthurus hepatus): royal blue, black "palette" band from eye to tail, yellow tail.
L = 0.3
body = fish_body('bluetang_body', L, 0.2, 0.07)
tail = fin([(-0.125, 0.012), (-0.2, 0.07), (-0.228, 0.075), (-0.205, 0), (-0.228, -0.075), (-0.2, -0.07), (-0.125, -0.012)], 0.012)
dorsal = fin([(-0.12, 0.06), (0.07, 0.085), (0.04, 0.115), (-0.06, 0.11), (-0.13, 0.085)], 0.008)
anal = fin([(-0.12, -0.055), (0.03, -0.075), (0.0, -0.1), (-0.09, -0.095), (-0.13, -0.07)], 0.008)
pec = fin([(0.03, -0.02), (-0.04, -0.035), (-0.03, -0.055), (0.035, -0.035)], 0.006)
for p in pec.data.vertices: p.co.y += 0.04
pec2 = fin([(0.03, -0.02), (-0.04, -0.035), (-0.03, -0.055), (0.035, -0.035)], 0.006)
for p in pec2.data.vertices: p.co.y -= 0.04
ey = eyes(0.095, 0.03, 0.032, 0.017)
o = join([body, tail, dorsal, anal, pec, pec2] + ey, 'fish_bluetang')
blue, black, yellow, white = srgb(0x2a55e0), srgb(0x14161f), srgb(0xffd23a), srgb(0xffffff)
def tang(co, n):
    x, y, z = co
    if abs(y) > 0.034 and (co - Vector((0.095, math.copysign(0.032, y), 0.03))).length < 0.018: return white if (co - Vector((0.101, math.copysign(0.044, y), 0.036))).length < 0.007 else black
    if x < -0.135: return yellow
    if x < -0.03 and z < -0.05 and abs(y) < 0.01 and x > -0.02: return yellow
    # palette band: a dark sweep from behind the eye along the upper flank, with a blue window in the middle
    band = abs(z - (0.02 + 0.035 * math.sin((x + 0.12) * 12))) < 0.022 and -0.13 < x < 0.08
    window = (x + 0.02) ** 2 / 0.0025 + (z - 0.005) ** 2 / 0.0004 < 1
    if (band and not window) or z > 0.085: return black
    return blue
vcolor(o, tang)
made.append(finish(o, 'fish_bluetang'))

# Clownfish (Amphiprion percula): orange with three white bars edged in black; fins edged black.
L = 0.11
body = fish_body('clown_body', L, 0.055, 0.035, 0.5)
tail = fin([(-0.043, 0.005), (-0.07, 0.024), (-0.082, 0.02), (-0.078, 0), (-0.082, -0.02), (-0.07, -0.024), (-0.043, -0.005)], 0.007)
dorsal = fin([(-0.04, 0.02), (0.03, 0.026), (0.02, 0.04), (-0.01, 0.034), (-0.045, 0.034)], 0.005)
anal = fin([(-0.035, -0.02), (0.0, -0.024), (-0.01, -0.035), (-0.035, -0.03)], 0.005)
ey = eyes(0.034, 0.008, 0.013, 0.008)
o = join([body, tail, dorsal, anal] + ey, 'fish_clownfish')
orange = srgb(0xff7a1a)
def clown(co, n):
    x, y, z = co
    if abs(y) > 0.012 and (co - Vector((0.034, math.copysign(0.013, y), 0.008))).length < 0.009: return white if (co - Vector((0.037, math.copysign(0.019, y), 0.011))).length < 0.004 else black
    for cx, hw in ((0.02, 0.006), (-0.005, 0.007), (-0.048, 0.004)):
        d = abs(x - cx)
        if d < hw: return white
        if d < hw + 0.0018: return black
    if (abs(z) > 0.03 or x < -0.074) and abs(y) < 0.006: return black
    return orange
vcolor(o, clown)
made.append(finish(o, 'fish_clownfish'))

# ---------------------------------------------------------------- layout for the preview, export
for o in bpy.data.objects:
    if o.type == 'META': bpy.data.objects.remove(o)
layout = {'rock_0': (-2.2, 0.8), 'rock_1': (-1.4, 1.6), 'rock_2': (2.0, 1.4), 'staghorn_0': (-1.0, 0), 'staghorn_1': (0.2, 0.9), 'staghorn_2': (1.3, -0.3),
          'brain_0': (0.4, -0.6), 'table_0': (-0.3, 1.9), 'softcoral_0': (-1.9, -0.6), 'softcoral_1': (1.9, 0.4)}
for o in made:
    if o.name in layout: o.location = (*layout[o.name], 0)
fishpos = {'fish_bluetang': ((0.3, -1.6, 0.6), 0.6), 'fish_clownfish': ((-0.6, -1.4, 0.35), 1.0)}
for name, (loc, rz) in fishpos.items():
    o = bpy.data.objects[name]; o.location = loc; o.rotation_euler = (0, 0, rz); o.scale = (3, 3, 3)

if PREVIEW:
    # Soft sandy ground, sun + sky light, EEVEE.
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, -0.02)); g = bpy.context.active_object
    gm = bpy.data.materials.new('sand'); gm.use_nodes = True; gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*lin(srgb(0xead7ad)), 1)
    g.data.materials.append(gm)
    w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (*lin(srgb(0x9fd8e8)), 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.5; sun.angle = math.radians(12)
    so = bpy.data.objects.new('sun', sun); scene.collection.objects.link(so); so.rotation_euler = (math.radians(40), math.radians(15), math.radians(30))
    cam = bpy.data.cameras.new('cam'); cam.lens = 40
    co = bpy.data.objects.new('cam', cam); scene.collection.objects.link(co); scene.camera = co
    co.location = (0, -6.5, 4.2); co.rotation_euler = (math.radians(58), 0, 0)
    for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try: scene.render.engine = eng; break
        except TypeError: pass
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.view_settings.view_transform = 'AgX' if 'AgX' in [i.identifier for i in scene.view_settings.bl_rna.properties['view_transform'].enum_items] else 'Standard'
    scene.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(g); bpy.data.objects.remove(so); bpy.data.objects.remove(co)

# Export only the assets, at the origin (the game positions them).
for o in made: o.location = (0, 0, 0); o.rotation_euler = (0, 0, 0); o.scale = (1, 1, 1)
bpy.ops.object.select_all(action='DESELECT')
for o in made: o.select_set(True)
kw = dict(filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_materials='NONE', export_yup=True)
try: bpy.ops.export_scene.gltf(**kw, export_vertex_color='ACTIVE')
except TypeError: bpy.ops.export_scene.gltf(**kw, export_colors=True)
tris = {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in made}
print('EXPORTED', OUT, tris)
