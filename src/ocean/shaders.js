// Shared GLSL snippets and the global uniforms every ocean-aware material reads.
import * as THREE from 'three';

export const globalUniforms = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(0.35, 0.8, -0.45).normalize() },
  uWaterLevel: { value: 0 },
  uCaustics: { value: 1 },
  uAbsorb: { value: new THREE.Vector3(0.20, 0.045, 0.03) }, // per-metre light absorption (red goes first)
  uWaterTint: { value: new THREE.Color(0x0d6f8a) },
  uDeepTint: { value: new THREE.Color(0x02263a) },
  uShallowTint: { value: new THREE.Color(0x2fd1c5) },
  uSkyTop: { value: new THREE.Color(0x2f7fd8) },
  uSkyHorizon: { value: new THREE.Color(0xbfe6f5) },
  uUnderwater: { value: 0 },
  uFogColor: { value: new THREE.Color(0x0b5d78) },
  uFogDensity: { value: 0.03 },
  uBleach: { value: 0 },  // coral bleaching 0..1 (health lab)
  uDead: { value: 0 },    // algae overgrowth on dead coral 0..1
};

export const skyGLSL = /* glsl */`
uniform vec3 uSunDir; uniform vec3 uSkyTop; uniform vec3 uSkyHorizon;
float skyHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float skyNoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(skyHash(i), skyHash(i + vec2(1, 0)), u.x), mix(skyHash(i + vec2(0, 1)), skyHash(i + vec2(1, 1)), u.x), u.y); }
// Fair-weather cumulus on a flat cloud layer, thinning toward the horizon (static: no time uniform here).
float skyClouds(vec3 d) {
  if (d.y <= 0.0) return 0.0;
  vec2 p = d.xz / (d.y + 0.1) * 1.4 + vec2(3.7, 1.3);
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * skyNoise(p); p = p * 2.03 + vec2(11.3, 7.1); a *= 0.5; }
  return smoothstep(0.5, 0.78, s) * smoothstep(0.0, 0.2, d.y);
}
vec3 skyColor(vec3 d) {
  float y = max(d.y, -0.05);
  vec3 col = mix(uSkyHorizon, uSkyTop, pow(clamp(y, 0.0, 1.0), 0.45));
  float s = max(dot(d, uSunDir), 0.0);
  float cl = skyClouds(d);
  // Clouds: bright, slightly warm tops toward the sun, blue-grey bases away from it.
  vec3 cloud = mix(vec3(0.66, 0.7, 0.78), vec3(1.05, 1.02, 0.97), 0.45 + 0.55 * pow(s, 3.0));
  col = mix(col, cloud, cl * 0.9);
  col += vec3(1.0, 0.92, 0.75) * (pow(s, 900.0) * 30.0 * (1.0 - cl) + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.08);
  col = mix(col, uSkyHorizon * 0.95, smoothstep(0.02, -0.08, d.y));
  return col;
}
`;

// Classic animated water caustics (after joltz0r), returns 0..~1.
export const causticGLSL = /* glsl */`
float causticPattern(vec2 p, float t) {
  vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0; c = 1.17 - pow(clamp(c, 0.0, 3.0), 1.4);
  return min(pow(abs(c), 7.0), 3.0);
}
`;

// Underwater "fog" seen in a direction: brighter toward the surface and the refracted sun, darker looking down.
// Shared by lit materials, the sky dome and the underside of the water so everything fades into the same backdrop.
export const uwFogGLSL = /* glsl */`
vec3 uwFogColor(vec3 d, vec3 fogCol, vec3 sunDir) {
  float up = d.y;
  vec3 c = fogCol * (mix(0.62, 1.0, smoothstep(-0.75, 0.05, up)) + 0.5 * smoothstep(0.0, 1.0, up));
  vec3 sd = normalize(vec3(sunDir.x * 0.6, sunDir.y, sunDir.z * 0.6)); // sun refracted toward the vertical
  float s = max(dot(d, sd), 0.0);
  c += fogCol * (pow(s, 5.0) * 0.45 + pow(s, 48.0) * 0.6);
  return c;
}
`;

export const noiseGLSL = /* glsl */`
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;

/**
 * Patch a built-in material so it gets underwater caustics and depth absorption.
 * opts.swim: add fish swimming deformation (expects attribute aSwim = phase, amplitude scale).
 * opts.coral: respond to bleaching uniforms.
 * opts.sway: gentle current sway for soft corals / kelp (amplitude in metres per metre of height).
 */
export function patchUnderwater(material, opts = {}) {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uWaterCol = globalUniforms.uWaterTint;
    for (const k of ['uTime', 'uWaterLevel', 'uCaustics', 'uAbsorb', 'uSunDir', 'uBleach', 'uDead', 'uUnderwater']) shader.uniforms[k] = globalUniforms[k];
    shader.uniforms.uSwimLen = { value: opts.swimLength ?? 1 };
    shader.uniforms.uSway = { value: opts.sway ?? 0 };
    let vHead = `varying vec3 vWPos;\nuniform float uTime; uniform float uSwimLen; uniform float uSway;\n`;
    if (opts.swim) vHead += 'attribute vec2 aSwim;\n';
    if (opts.coral) vHead += 'attribute float aBleach;\nvarying float vBleach;\n';
    if (opts.detail) vHead += 'varying vec3 vLocal;\n';
    if (opts.fish) vHead += 'attribute vec2 aFin;\nvarying vec2 vFin;\n';
    shader.vertexShader = vHead + shader.vertexShader;
    let deform = '';
    if (opts.swim) {
      // Body wave: amplitude grows toward the tail (model faces +x, tail at -x).
      deform += `
        float tailT = clamp((-transformed.x / uSwimLen) + 0.35, 0.0, 1.3);
        float wv = sin(aSwim.x - transformed.x * ${(opts.waveK ?? 6.0).toFixed(2)} / uSwimLen);
        ${opts.vertical ? 'transformed.y' : 'transformed.z'} += wv * tailT * tailT * aSwim.y * ${opts.vertical ? '0.08' : '0.12'} * uSwimLen;
      `;
      if (opts.flap) {
        // Rays: wings (|z| large) flap vertically.
        deform += `
          float span = abs(transformed.z) / uSwimLen;
          transformed.y += sin(aSwim.x * 0.5 - span * 1.4) * span * span * aSwim.y * 0.55 * uSwimLen;
        `;
      }
    }
    if (opts.pulse) {
      // Jellies: the bell rhythmically contracts (narrower + taller), arms follow.
      deform += `
        float pz = sin(uTime * 2.2 + (modelMatrix[3].x + modelMatrix[3].z) * 3.0);
        #ifdef USE_INSTANCING
          pz = sin(uTime * 2.2 + (instanceMatrix[3].x * 1.3 + instanceMatrix[3].z) * 3.0);
        #endif
        float bellK = smoothstep(-0.25, 0.1, transformed.y);
        transformed.xz *= 1.0 - 0.12 * pz * bellK;
        transformed.y += 0.03 * pz * bellK;
        transformed.x += (1.0 - bellK) * sin(uTime * 1.3 + transformed.y * 8.0) * 0.03;
      `;
    }
    if (opts.sway) {
      deform += `
        vec3 wp0 = (modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;
        #ifdef USE_INSTANCING
          wp0 = (modelMatrix * instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;
        #endif
        float hgt = max(transformed.y, 0.0);
        float ph = uTime * 1.1 + wp0.x * 0.3 + wp0.z * 0.2 + (transformed.x + transformed.z) * 6.0;
        transformed.x += sin(ph) * uSway * hgt * hgt;
        transformed.z += cos(ph * 0.8) * uSway * 0.6 * hgt * hgt;
      `;
    }
    if (opts.coral) deform += 'vBleach = aBleach;\n';
    if (opts.detail) deform += 'vLocal = position;\n';
    if (opts.fish) deform += 'vFin = aFin;\n';
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + deform);
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 wpw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        wpw = instanceMatrix * wpw;
      #endif
      vWPos = (modelMatrix * wpw).xyz;`);

    let fHead = `varying vec3 vWPos;\nuniform vec3 uWaterCol; uniform float uTime; uniform float uWaterLevel; uniform float uCaustics; uniform vec3 uAbsorb; uniform vec3 uSunDir; uniform float uBleach; uniform float uDead; uniform float uUnderwater;\n` + causticGLSL + uwFogGLSL;
    if (opts.coral) fHead += 'varying float vBleach;\n';
    if (opts.detail) fHead += `varying vec3 vLocal;
      float dHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float dNoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
        return mix(mix(mix(dHash(i), dHash(i+vec3(1,0,0)), f.x), mix(dHash(i+vec3(0,1,0)), dHash(i+vec3(1,1,0)), f.x), f.y),
                   mix(mix(dHash(i+vec3(0,0,1)), dHash(i+vec3(1,0,1)), f.x), mix(dHash(i+vec3(0,1,1)), dHash(i+vec3(1,1,1)), f.x), f.y), f.z); }
    `;
    if (opts.fish) fHead += 'varying vec2 vFin;\n';
    shader.fragmentShader = fHead + shader.fragmentShader;
    if (opts.fish) {
      // Fins: bony rays from base to edge, thinning to a ragged, see-through margin (alpha-to-coverage with MSAA).
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        if (vFin.y >= 0.0) {
          float nr = 16.0;
          float ray = smoothstep(0.55, 1.0, abs(sin(vFin.x * nr * 3.14159)));
          float edge = smoothstep(0.45, 1.0, vFin.y);
          diffuseColor.rgb *= mix(1.0, 0.82, ray * (0.4 + 0.6 * vFin.y));
          // Membrane between rays is thinner and recedes slightly at the margin (small notches), rays reach the edge.
          diffuseColor.a = (1.0 - edge * mix(0.4, 0.1, ray)) * step(vFin.y, 0.96 + 0.04 * ray);
        }`);
      // Wet skin: glossy eyes, satin body, duller fins.
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        if (vFin.y < -1.5) roughnessFactor = 0.06; else if (vFin.y >= 0.0) roughnessFactor = max(roughnessFactor, 0.6);`);
    }
    if (opts.coral) {
      // Bleaching: patches turn white once stress passes each colony's threshold; dead coral greys and grows algae.
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float bl = smoothstep(vBleach - 0.08, vBleach + 0.08, uBleach);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.93, 0.9), bl * 0.92);
        float dd = smoothstep(vBleach - 0.1, vBleach + 0.1, uDead);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.32, 0.33, 0.2) * (0.8 + 0.4 * sin(vWPos.x * 3.1) * sin(vWPos.z * 2.7)), dd * 0.9);`);
    }
    if (opts.detail) {
      // Polyp/texture micro-relief: perturb the normal with world-space noise, and darken crevices near the base.
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          float f = ${(opts.detailScale ?? 38).toFixed(1)};
          vec3 q = vWPos * f;
          float n0 = dNoise(q), nx = dNoise(q + vec3(0.35, 0.0, 0.0)), ny = dNoise(q + vec3(0.0, 0.35, 0.0)), nz = dNoise(q + vec3(0.0, 0.0, 0.35));
          vec3 g = vec3(nx - n0, ny - n0, nz - n0);
          vec3 gv = (viewMatrix * vec4(g, 0.0)).xyz;
          normal = normalize(normal - gv * ${(opts.detailStrength ?? 0.9).toFixed(2)});
        }`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= mix(0.45, 1.0, smoothstep(0.0, 0.22, vLocal.y));
        diffuseColor.rgb *= 0.85 + 0.3 * dNoise(vWPos * 9.0);`);
    }
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      {
        float depth = uWaterLevel - vWPos.y;
        ${opts.transl ? `{
          // Thin blades glow when lit from behind (kelp, seagrass seen against the light).
          vec3 wNt = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          float back = max(-dot(wNt, uSunDir), 0.0);
          float toward = pow(max(dot(normalize(vWPos - cameraPosition), uSunDir), 0.0), 2.0);
          outgoingLight += diffuseColor.rgb * vec3(1.05, 1.0, 0.7) * back * (0.25 + 0.75 * toward) * ${opts.transl.toFixed(2)};
        }` : ''}
        if (depth > 0.0) {
          vec2 cp = vWPos.xz * 0.42 + uSunDir.xz * depth * 0.15;
          float c = causticPattern(cp, uTime * 0.55) * 0.75 + causticPattern(cp * 1.7 + 3.1, uTime * 0.7) * 0.35;
          // Caustics are focused sunlight: scale the direct sun term, so they fall off with the surface angle and vanish in shadow.
          outgoingLight += reflectedLight.directDiffuse * min(c, 1.4) * uCaustics * exp(-depth * 0.09) * 1.5;
          outgoingLight *= exp(-uAbsorb * depth);
          if (uUnderwater < 0.5) {
            // Seen from above the surface: light travels back up through the water to the eye.
            vec3 Vw = normalize(cameraPosition - vWPos);
            float path = depth / max(0.12, Vw.y);
            outgoingLight *= exp(-uAbsorb * path * 0.8);
            outgoingLight = mix(outgoingLight, uWaterCol, 1.0 - exp(-path * 0.06));
          }
        }
      }
      #include <opaque_fragment>`);
    // Underwater, light is lost along the line of sight too (red first), then scattered toward a
    // direction-dependent backdrop colour instead of a single flat fog colour.
    shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
      #if defined(USE_FOG) && defined(FOG_EXP2)
        if (uUnderwater > 0.5) {
          vec3 Vf = vWPos - cameraPosition; float fd = length(Vf);
          gl_FragColor.rgb *= exp(-uAbsorb * fd * 0.25);
          float ff = 1.0 - exp(-fogDensity * fogDensity * fd * fd);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uwFogColor(Vf / max(fd, 1e-3), fogColor, uSunDir), ff);
        } else {
          #include <fog_fragment>
        }
      #else
        #include <fog_fragment>
      #endif`);
  };
  material.customProgramCacheKey = () => 'uw' + (opts.key ?? '') + (opts.vertical ? 'v' : '') + (opts.pulse ? 'p' : '') + (opts.detail ? 'd' + (opts.detailScale ?? '') : '') + (opts.swim ? 's' : '') + (opts.flap ? 'f' : '') + (opts.coral ? 'c' : '') + (opts.transl ? 't' + opts.transl : '') + (opts.fish ? 'F' : '') + (opts.sway ? 'w' + opts.sway : '') + (opts.swimLength ?? '') + (opts.waveK ?? '');
  return material;
}
