// Heightfield seabed. Each ecosystem supplies a height function and a substrate colour function.
import * as THREE from 'three';
import { patchUnderwater } from '../ocean/shaders.js';

/** Canvas texture of fine grain + ripples, tiled across the seabed. */
function makeDetailTexture(noise, kind = 'sand') {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    // Tileable: sample noise on a torus.
    const a = (x / size) * Math.PI * 2, b = (y / size) * Math.PI * 2;
    const nx = Math.cos(a) * 1.6, ny = Math.sin(a) * 1.6, nz = Math.cos(b) * 1.6, nw = Math.sin(b) * 1.6;
    const n = noise.n3(nx * 3 + nz * 0.7, ny * 3 + nw * 0.4, nz * 3 + nw * 3);
    const fine = noise.n3(nx * 14, ny * 14 + nw * 9, nz * 14);
    const ripple = kind === 'sand' ? Math.sin((x / size) * Math.PI * 2 * 9 + n * 4) * 0.5 + 0.5 : 0.5;
    let v = 0.78 + n * 0.12 + fine * 0.1 + (ripple - 0.5) * 0.12;
    v = Math.max(0, Math.min(1, v));
    const i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function bumpFromTexture(tex) {
  // The same grayscale texture doubles as a bump map.
  return tex;
}

export class Terrain {
  /**
   * @param {object} eco - ecosystem with heightAt(x,z), colorAt(x,z,h,slope) -> [r,g,b], size, segments
   */
  constructor(scene, eco, noise, quality) {
    this.eco = eco;
    const size = eco.terrainSize ?? 320;
    const segs = Math.round((eco.terrainSegments ?? 256) * quality.terrainScale);
    this.size = size;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, eco.heightAt(x, z));
    }
    geo.computeVertexNormals();
    const nrm = geo.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = pos.getY(i);
      const [r, g, b] = eco.colorAt(x, z, h, 1 - nrm.getY(i));
      colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const tex = makeDetailTexture(noise, eco.seabedKind ?? 'sand');
    tex.repeat.set(size / 3.5, size / 3.5);
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, map: tex, bumpMap: bumpFromTexture(tex), bumpScale: 1.5, roughness: 0.95, metalness: 0,
    });
    patchUnderwater(mat);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = false;
    scene.add(this.mesh);
    this.depthTex = Terrain.depthTexture(eco, size);
  }

  /** Low-res seabed height texture for the water shader (h = r*60-50). */
  static depthTexture(eco, size = 320, res = 128) {
    const data = new Uint8Array(res * res * 4);
    for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
      const x = -size / 2 + (i + 0.5) / res * size, z = -size / 2 + (j + 0.5) / res * size;
      const h = eco.heightAt(x, z);
      const v = Math.max(0, Math.min(255, ((h + 50) / 60) * 255));
      const k = (j * res + i) * 4;
      data[k] = v; data[k + 1] = v; data[k + 2] = v; data[k + 3] = 255;
    }
    const t = new THREE.DataTexture(data, res, res);
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
    t.box = new THREE.Vector4(-size / 2, -size / 2, size, size);
    return t;
  }

  heightAt(x, z) { return this.eco.heightAt(x, z); }
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.mesh.parent?.remove(this.mesh); }
}
