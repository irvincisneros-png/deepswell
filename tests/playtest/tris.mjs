// Triangle budget per mesh (tris per instance x instances) at one site. ECO=gbr QUALITY=ultra node tests/playtest/tris.mjs
import { launch } from './harness.mjs';
const t = await launch({ query: `eco=${process.env.ECO ?? 'gbr'}&quality=${process.env.QUALITY ?? 'ultra'}` });
const r = await t.page.evaluate(() => {
  const rows = [];
  window.__game.scene.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry, tri = (g.index ? g.index.count : g.attributes.position.count) / 3, n = o.isInstancedMesh ? o.count : 1;
    rows.push({ name: o.name || o.userData.kind || o.material?.type, tri, n, total: tri * n });
  });
  rows.sort((a, b) => b.total - a.total);
  return { sum: rows.reduce((s, r) => s + r.total, 0), meshes: rows.length, top: rows.slice(0, 25) };
});
console.log(r.sum, r.meshes, '\n' + r.top.map(x => `${x.total}\t${x.tri}x${x.n}\t${x.name}`).join('\n'));
await t.close();
