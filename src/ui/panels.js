// Modal panels. Each opener renders into #modal-body; game pauses look controls while open.
import { simulate, explain, dhw, initialState } from '../learn/reefModel.js';
import { TIERS } from '../core/settings.js';

const $ = (s, r = document) => r.querySelector(s);
export const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const stars = q => '★'.repeat(q) + '☆'.repeat(3 - q);
const BEHAVIOUR_NAMES = { cleaning: 'Cleaning interaction', grazing: 'Grazing / bioerosion', breathing: 'Surfacing to breathe', closing: 'Shell closing', schooling: 'Schooling', symbiosis: 'Living in its host' };

export class Panels {
  constructor(game) {
    this.game = game;
    this.modal = $('#modal'); this.body = $('#modal-body');
    $('#modal-close').addEventListener('click', () => this.close());
    this.modal.addEventListener('mousedown', e => { if (e.target === this.modal) this.close(); });
    addEventListener('keydown', e => { if (e.code === 'Escape' && this.isOpen) { e.preventDefault(); this.close(); } });
    this.onClose = null;
  }
  get isOpen() { return !this.modal.classList.contains('hidden'); }
  open(html, onClose) {
    this.body.innerHTML = html;
    this.modal.classList.remove('hidden');
    this.game.input.unlock();
    this.onClose = onClose ?? null;
    this.body.scrollTop = 0; this.modal.querySelector('.panel').scrollTop = 0;
  }
  close() {
    if (!this.isOpen) return;
    this.modal.classList.add('hidden');
    this.body.innerHTML = '';
    const cb = this.onClose; this.onClose = null;
    cb?.();
    this.game.onPanelClosed();
  }

  // ---------------------------------------------------------------- species card
  card(sp, entry) {
    const photo = entry?.photo ? `style="background-image:url(${entry.photo})"` : '';
    const unlocked = !!entry;
    const html = `
      <div class="card-top">
        <div>
          <div class="card-photo" ${photo}>${entry?.photo ? '' : '📷 Photograph this species<br>to add it to your journal'}</div>
          ${entry ? `<p class="stars" title="Best photo">${stars(entry.quality ?? 1)}</p>` : ''}
        </div>
        <div>
          <h2>${esc(sp.common)} <span class="status ${esc(sp.statusCode)}" title="IUCN Red List">${esc(sp.status)}</span></h2>
          <div class="sci">${esc(sp.sci)}</div>
          <div class="facts">
            <div><b>Size</b>${esc(sp.size)}</div><div><b>Depth</b>${esc(sp.depth)}</div>
            <div><b>Feeding</b>${esc(sp.feeding)}</div><div><b>Trophic level</b>${esc(sp.trophic)}</div>
          </div>
        </div>
      </div>
      <h3>Role in the ecosystem</h3><p>${esc(sp.role)}</p>
      <h3>Interactions</h3><ul class="inter">${(sp.interactions || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <div class="dyk"><b>Did you know?</b> ${esc(sp.didYouKnow)}</div>
      <h3>Watch for</h3><p>${esc(sp.spot)}</p>
      <h3>Field notes</h3>
      ${unlocked ? `<p>${esc(sp.fieldNotes)}</p>` : `<div class="locked">🔒 Photograph this species to unlock detailed field notes.</div>`}
      ${entry?.behaviours?.length ? `<p><b>Behaviours you've recorded:</b> ${entry.behaviours.map(b => esc(BEHAVIOUR_NAMES[b] ?? b)).join(', ')}</p>` : ''}
      <h3>Threats</h3><p>${esc(sp.threats)}</p>
      <p class="sources">Sources: ${(sp.sources || []).map(esc).join('; ')}</p>`;
    this.open(html);
  }

  // ---------------------------------------------------------------- journal
  journal(eco, ecos, progress, startTab = 'species') {
    const render = (ecoId, tab) => {
      const e = ecos.find(x => x.id === ecoId);
      const list = e.speciesInfo;
      const have = list.filter(s => progress.journal[`${e.id}:${s.id}`]);
      const groups = ['all', ...new Set(list.map(s => s.group))];
      const total = ecos.reduce((a, x) => a + x.speciesInfo.length, 0);
      const got = Object.keys(progress.journal).length;
      const filtered = tab === 'all' || tab === 'species' ? list : list.filter(s => s.group === tab);
      this.body.innerHTML = `
        <h2>Field journal</h2>
        <p>${got} of ${total} species logged across all sites. Photograph animals and corals to add them; tap an entry for its field guide.</p>
        <div class="tabs">${ecos.map(x => `<button data-eco="${x.id}" class="${x.id === ecoId ? 'on' : ''}">${esc(x.name)}</button>`).join('')}</div>
        <div class="tabs">${groups.map(g => `<button data-tab="${g}" class="${(tab === g || (tab === 'species' && g === 'all')) ? 'on' : ''}">${g === 'all' ? 'All' : esc(g)}</button>`).join('')}
          <span style="margin-left:auto;color:var(--muted);font-size:13px">${have.length}/${list.length} at ${esc(e.name)}</span></div>
        <div class="journal-grid">${filtered.map(s => {
          const j = progress.journal[`${e.id}:${s.id}`];
          return `<button class="jcell ${j ? '' : 'unk'}" data-id="${s.id}" data-e="${e.id}">
            <div class="ph" ${j?.photo ? `style="background-image:url(${j.photo})"` : ''}>${j?.photo ? '' : '?'}</div>
            <div class="nm">${j ? esc(s.common) : esc(s.common)}<small>${j ? stars(j.quality ?? 1) : 'Not yet photographed'}</small></div></button>`;
        }).join('')}</div>
        <p style="margin-top:16px"><button class="btn small" id="j-csv">Export journal + survey data (CSV)</button></p>`;
      this.body.querySelectorAll('[data-eco]').forEach(b => b.onclick = () => render(b.dataset.eco, 'all'));
      this.body.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => render(ecoId, b.dataset.tab));
      this.body.querySelectorAll('.jcell').forEach(b => b.onclick = () => {
        const ec = ecos.find(x => x.id === b.dataset.e);
        const sp = ec.speciesInfo.find(s => s.id === b.dataset.id);
        this.card(sp, progress.journal[`${ec.id}:${sp.id}`]);
      });
      $('#j-csv', this.body).onclick = () => this.game.exportCSV();
    };
    this.open('');
    render(eco.id, 'all');
  }

  // ---------------------------------------------------------------- missions
  missions(eco, progress, onStart) {
    const ms = eco.missions;
    const html = `
      <h2>Missions — ${esc(eco.name)}</h2>
      <p>Each mission sends you on a short field task, then asks a few check questions. Pick one to track it on screen.</p>
      ${ms.map(m => {
        const st = progress.missions[`${eco.id}:${m.id}`] ?? {};
        const done = st.complete;
        return `<div class="mission ${done ? 'done' : ''}">
          <div class="row"><h3 style="margin:0;color:var(--ink);font-size:18px;text-transform:none;letter-spacing:0">${done ? '✅ ' : st.goalMet ? '🟡 ' : ''}${esc(m.title)}</h3>
            <div>${st.goalMet && !done ? `<button class="btn small primary" data-quiz="${m.id}">Answer check questions</button>` : ''}
            <button class="btn small" data-track="${m.id}">${this.game.activeMission?.id === m.id ? 'Tracking ✓' : 'Track'}</button></div></div>
          <p>${esc(m.brief)}</p>
          <p style="color:var(--muted);font-size:14px">💡 ${esc(m.hint)}${done ? ` · Score ${st.score}/${m.questions.length}` : ''}</p>
        </div>`;
      }).join('')}`;
    this.open(html);
    this.body.querySelectorAll('[data-track]').forEach(b => b.onclick = () => { onStart(ms.find(m => m.id === b.dataset.track)); this.close(); });
    this.body.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => this.quiz(eco, ms.find(m => m.id === b.dataset.quiz), progress));
  }

  quiz(eco, m, progress, onDone) {
    let i = 0, score = 0;
    const step = () => {
      if (i >= m.questions.length) {
        const key = `${eco.id}:${m.id}`;
        progress.missions[key] = { ...(progress.missions[key] ?? {}), goalMet: true, complete: true, score };
        this.game.persist();
        this.body.innerHTML = `<h2>Mission complete: ${esc(m.title)}</h2><p class="result-big">${score}/${m.questions.length}</p><p>${score === m.questions.length ? 'Perfect — you think like a marine scientist.' : 'Good work. Read the explanations again and you\'ll have it.'}</p><p><button class="btn primary" id="q-done">Back to the water</button></p>`;
        $('#q-done', this.body).onclick = () => this.close();
        onDone?.();
        return;
      }
      const q = m.questions[i];
      this.body.innerHTML = `<h2>${esc(m.title)}</h2><p style="color:var(--muted)">Question ${i + 1} of ${m.questions.length}</p>
        <div class="q"><p><b>${esc(q.q)}</b></p><div class="opts">${q.options.map((o, k) => `<button data-k="${k}">${esc(o)}</button>`).join('')}</div><div class="explain"></div></div>`;
      const btns = this.body.querySelectorAll('.opts button');
      btns.forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        btns.forEach(x => { x.disabled = true; if (+x.dataset.k === q.answer) x.classList.add('right'); });
        if (k === q.answer) score++; else b.classList.add('wrong');
        this.game.audio.blip(k === q.answer ? 990 : 220, 0.15, 0.08);
        const ex = $('.explain', this.body);
        ex.innerHTML = `${k === q.answer ? '✅ Correct.' : '❌ Not quite.'} ${esc(q.explain)} <p><button class="btn small primary" id="q-next">${i + 1 < m.questions.length ? 'Next question' : 'Finish'}</button></p>`;
        $('#q-next', this.body).onclick = () => { i++; step(); };
      });
    };
    this.open('');
    step();
  }

  // ---------------------------------------------------------------- reef health lab
  lab(eco, apply, onResult) {
    const d0 = eco.labDefaults ?? { temp: 0, nutrients: 0.2, cots: 0.15, fishing: 0.2 };
    const inp = { ...d0, every: false, years: 5 };
    const labels = eco.labLabels ?? {};
    const html = `
      <h2>${esc(labels.title ?? 'Reef health lab')}</h2>
      <p>${esc(labels.intro ?? 'Change the pressures on this reef and fast-forward time. Watch the reef around you respond — then explain what happened.')}</p>
      <div class="lab-grid">
        <div>
          <div class="slider"><label>Summer sea temperature <b id="v-temp"></b></label><input id="s-temp" type="range" min="0" max="3" step="0.1"><small>°C above the normal summer maximum</small></div>
          <label style="font-size:14px"><input type="checkbox" id="s-every"> Heatwave every summer (not just year 1)</label>
          <div class="slider"><label>Nutrient runoff <b id="v-nutrients"></b></label><input id="s-nutrients" type="range" min="0" max="1" step="0.05"><small>Fertiliser and sediment from farms and rivers</small></div>
          <div class="slider"><label>Crown-of-thorns starfish <b id="v-cots"></b></label><input id="s-cots" type="range" min="0" max="1" step="0.05"><small>Starting starfish density</small></div>
          <div class="slider"><label>Fishing pressure <b id="v-fishing"></b></label><input id="s-fishing" type="range" min="0" max="1" step="0.05"><small>Removal of herbivores and predators</small></div>
          <div class="slider"><label>Years to fast-forward <b id="v-years"></b></label><input id="s-years" type="range" min="1" max="10" step="1"></div>
          <p><button class="btn primary" id="lab-run">▶ Run time-lapse</button> <button class="btn" id="lab-reset">Reset reef</button></p>
        </div>
        <div>
          <canvas class="chart" id="lab-chart" width="640" height="300"></canvas>
          <div class="readout"><div><b id="r-coral">32%</b>coral cover</div><div><b id="r-algae">12%</b>algae cover</div><div><b id="r-time">Year 0</b>&nbsp;</div></div>
          <div class="explain-box" id="lab-explain"></div>
        </div>
      </div>`;
    this.open(html, () => { this.labRunning = false; });
    const ids = ['temp', 'nutrients', 'cots', 'fishing', 'years'];
    const fmt = { temp: v => `+${(+v).toFixed(1)} °C`, nutrients: v => pct(v), cots: v => pct(v), fishing: v => pct(v), years: v => `${v}` };
    function pct(v) { return `${Math.round(v * 100)}%`; }
    const sync = () => {
      for (const k of ids) { inp[k] = +$(`#s-${k}`).value; $(`#v-${k}`).textContent = fmt[k](inp[k]); }
      inp.every = $('#s-every').checked;
      $('#lab-explain').textContent = explain(inp);
    };
    for (const k of ids) { $(`#s-${k}`).value = inp[k]; $(`#s-${k}`).oninput = sync; }
    $('#s-every').onchange = sync;
    sync();
    const chart = $('#lab-chart');
    const draw = (series, upto) => {
      const g = chart.getContext('2d'), W = chart.width, H = chart.height;
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1; g.font = '20px system-ui'; g.fillStyle = 'rgba(200,230,240,0.7)';
      for (let y = 0; y <= 100; y += 25) { const py = H - 30 - (y / 100) * (H - 50); g.beginPath(); g.moveTo(50, py); g.lineTo(W - 10, py); g.stroke(); g.fillText(`${y}%`, 4, py + 6); }
      const n = series.length - 1;
      const line = (key, col, scale = 1) => {
        g.strokeStyle = col; g.lineWidth = 4; g.beginPath();
        for (let i = 0; i <= upto; i++) { const px = 50 + (i / n) * (W - 60), py = H - 30 - Math.min(1, series[i][key] * scale) * (H - 50); i ? g.lineTo(px, py) : g.moveTo(px, py); }
        g.stroke();
      };
      line('coral', '#ff8f6b'); line('algae', '#8bd16a'); line('bleach', '#f2f2f2', 0.5); line('cots', '#c58bff', 0.5);
      g.fillStyle = '#ff8f6b'; g.fillText('coral', 60, 24); g.fillStyle = '#8bd16a'; g.fillText('algae', 130, 24); g.fillStyle = '#f2f2f2'; g.fillText('bleaching', 200, 24); g.fillStyle = '#c58bff'; g.fillText('starfish', 310, 24);
    };
    let series = simulate(inp, 0);
    draw(series, 0);
    $('#lab-run').onclick = () => {
      sync();
      series = simulate(inp, inp.years);
      const t0 = performance.now(), dur = 1200 + inp.years * 900;
      this.labRunning = true;
      let maxBleach = 0;
      const tick = () => {
        if (!this.labRunning) return;
        const f = Math.min(1, (performance.now() - t0) / dur);
        const i = Math.round(f * (series.length - 1));
        const s = series[i];
        maxBleach = Math.max(maxBleach, s.bleach);
        draw(series, i);
        $('#r-coral').textContent = `${Math.round(s.coral * 100)}%`;
        $('#r-algae').textContent = `${Math.round(s.algae * 100)}%`;
        $('#r-time').textContent = `Year ${(i / 12).toFixed(1)}`;
        apply(s);
        if (f < 1) requestAnimationFrame(tick); else { this.labRunning = false; onResult?.({ inputs: { ...inp }, final: s, maxBleach, dhw: dhw(inp.temp) }); }
      };
      tick();
    };
    $('#lab-reset').onclick = () => { this.labRunning = false; const s = initialState(); apply(s); series = simulate(inp, 0); draw(series, 0); $('#r-coral').textContent = '32%'; $('#r-algae').textContent = '12%'; $('#r-time').textContent = 'Year 0'; };
  }

  // ---------------------------------------------------------------- settings / help / results
  settings(settings, onChange) {
    const html = `<h2>Settings</h2>
      <div class="settings-row"><span>Graphics quality<br><small style="color:var(--muted)">Lower this on school laptops. Changes reload the site.</small></span>
        <select id="set-q">${Object.entries(TIERS).map(([k, t]) => `<option value="${k}" ${settings.quality === k ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
      <div class="settings-row"><span>Mouse sensitivity</span><input id="set-sens" type="range" min="0.3" max="2.5" step="0.1" value="${settings.sensitivity}"></div>
      <div class="settings-row"><span>Invert look up/down</span><input id="set-inv" type="checkbox" ${settings.invertY ? 'checked' : ''}></div>
      <div class="settings-row"><span>Volume</span><input id="set-vol" type="range" min="0" max="1" step="0.05" value="${settings.volume}"></div>
      <div class="settings-row"><span>Reduced motion (steadier camera)</span><input id="set-rm" type="checkbox" ${settings.reducedMotion ? 'checked' : ''}></div>
      <div class="settings-row"><span>Pause breath while reading info cards</span><input id="set-fz" type="checkbox" ${settings.freezeBreathInCards ? 'checked' : ''}></div>
      <p style="margin-top:16px"><button class="btn small" id="set-reset">Reset all progress</button></p>`;
    this.open(html);
    const ch = (k, v) => onChange(k, v);
    $('#set-q').onchange = e => ch('quality', e.target.value);
    $('#set-sens').oninput = e => ch('sensitivity', +e.target.value);
    $('#set-inv').onchange = e => ch('invertY', e.target.checked);
    $('#set-vol').oninput = e => ch('volume', +e.target.value);
    $('#set-rm').onchange = e => ch('reducedMotion', e.target.checked);
    $('#set-fz').onchange = e => ch('freezeBreathInCards', e.target.checked);
    $('#set-reset').onclick = () => { if (confirm('Delete all journal photos and mission progress on this device?')) ch('resetProgress', true); };
  }
  help() {
    this.open(`<h2>How to play</h2>
      <div class="help-grid">
        <div><h3>🏄 Surfing</h3><p><kbd>W</kbd> paddle (hold) · <kbd>A</kbd>/<kbd>D</kbd> steer.<br>When a wave lifts you, press <kbd>Space</kbd> to pop up.<br>Riding: <kbd>A</kbd> drop down the face, <kbd>D</kbd> climb toward the lip, <kbd>W</kbd> pump for speed, <kbd>S</kbd> crouch in the barrel.<br>Stay ahead of the breaking whitewater!</p></div>
        <div><h3>🤿 Freediving</h3><p>Mouse to look · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> swim · <kbd>Space</kbd> up · <kbd>C</kbd> down · <kbd>Shift</kbd> strong kicks (uses more O₂).<br>At the surface, look down and swim to duck-dive.<br><kbd>Q</kbd> equalise your ears every couple of metres. Surface before your O₂ runs out.</p></div>
        <div><h3>🔬 Science tools</h3><p>Click a creature or coral for its field-guide card.<br><kbd>F</kbd> underwater camera — photograph species and behaviours for your journal.<br><kbd>J</kbd> journal · <kbd>M</kbd> missions · <kbd>L</kbd> reef health lab.<br><kbd>E</kbd> near your board: paddle back out to surf.</p></div>
        <div><h3>🫁 Real freediving safety</h3><p>Never freedive alone — shallow-water blackout gives no warning. Never hyperventilate before a dive. Always equalise early and gently, and turn around before you feel the urge to breathe.</p></div>
      </div>`);
  }
  result(r, onDive, onSurf) {
    const title = r.kind === 'wipeout' ? 'Wipeout!' : 'Ride complete';
    this.open(`<h2>${title}</h2><p>${esc(r.reason)}</p>
      ${r.rode ? `<p class="result-big">${r.score}</p><p>points · ride ${r.time.toFixed(1)} s · top speed ${Math.round(r.maxSpeed * 3.6)} km/h</p>` : ''}
      <p style="color:var(--muted)">${r.kind === 'wipeout' ? 'You\'re underwater now — the whitewater pushed you down. Kick for the surface, catch your breath, then explore the reef below.' : 'Roll off your board and dive down to see what lives on the reef that made this wave break.'}</p>
      <p><button class="btn primary" id="r-dive">${r.kind === 'wipeout' ? 'Swim!' : 'Dive in'}</button> <button class="btn" id="r-surf">Paddle back out</button></p>`, () => onDive());
    $('#r-dive', this.body).onclick = () => this.close();
    $('#r-surf', this.body).onclick = () => { this.onClose = null; this.close(); onSurf(); };
  }
}
