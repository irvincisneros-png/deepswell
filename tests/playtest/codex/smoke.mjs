import { launch } from '../harness.mjs';
const t = await launch({outDir:'playtest-shots/codex',query:process.env.Q ?? 'quality=high'});
console.log(await t.state()); await t.shot('high-menu'); await t.close();
