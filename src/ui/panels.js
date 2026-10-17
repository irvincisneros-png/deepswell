// Modal panels. Each opener renders into #modal-body; game pauses look controls while open.
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
    if (!this.isOpen) this.returnFocus = document.activeElement;
    this.body.innerHTML = html;
    this.modal.classList.remove('hidden');
    this.game.input.clear();
    requestAnimationFrame(() => (this.body.querySelector('button, [href], input, select, summary') ?? $('#modal-close')).focus());
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
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
    this.game.onPanelClosed();
  }

  // ---------------------------------------------------------------- species card
  card(sp, entry, onBack) {
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
      <p class="sources">Sources: ${(sp.sources || []).map(esc).join('; ')}</p>
      ${onBack ? '<p><button class="btn small" id="card-back">← Back to journal</button></p>' : ''}`;
    this.open(html);
    if (onBack) $('#card-back', this.body).onclick = onBack;
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
        this.card(sp, progress.journal[`${ec.id}:${sp.id}`], () => render(ecoId, tab));
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
            <div>${st.goalMet ? `<button class="btn small ${done ? '' : 'primary'}" data-quiz="${m.id}">${done ? 'Retry questions' : 'Answer check questions'}</button>` : ''}
            <button class="btn small" data-track="${m.id}">${this.game.activeMission?.id === m.id ? 'Tracking ✓' : 'Track'}</button></div></div>
          <p>${esc(m.brief)}</p>
          <p style="color:var(--muted);font-size:14px">💡 ${esc(m.hint)}</p>
          <p style="font-size:13px">${st.goalMet ? '✔ Field task done' : '○ Field task not done yet'} · ${st.attempts ? `Questions: best ${st.best}/${m.questions.length} (${st.attempts} attempt${st.attempts > 1 ? 's' : ''})` : 'Questions not attempted'}</p>
        </div>`;
      }).join('')}`;
    this.open(html);
    this.body.querySelectorAll('[data-track]').forEach(b => b.onclick = () => { onStart(ms.find(m => m.id === b.dataset.track)); this.close(); });
    this.body.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => this.quiz(eco, ms.find(m => m.id === b.dataset.quiz), progress));
  }

  quiz(eco, m, progress, onDone) {
    let i = 0, score = 0;
    const answers = [];
    const step = () => {
      if (i >= m.questions.length) {
        const key = `${eco.id}:${m.id}`;
        const prev = progress.missions[key] ?? {};
        const best = Math.max(prev.best ?? 0, score);
        const pass = Math.ceil(m.questions.length * 2 / 3);
        progress.missions[key] = { ...prev, goalMet: true, attempts: (prev.attempts ?? 0) + 1, score, best, complete: best >= pass, answers: answers.slice() };
        this.game.persist();
        this.body.innerHTML = `<h2>${best >= pass ? 'Mission complete' : 'Nearly there'}: ${esc(m.title)}</h2><p class="result-big">${score}/${m.questions.length}</p>
          <p>${score === m.questions.length ? 'Perfect — you think like a marine scientist.' : score >= pass ? 'Good work. Review the explanations below.' : `You need ${pass}/${m.questions.length} to complete the mission. Review the explanations and try again.`}</p>
          <h3>Review</h3>${m.questions.map((q, k) => `<p><b>${answers[k] === q.answer ? '✅' : '❌'} ${esc(q.q)}</b><br>${esc(q.options[q.answer])} — ${esc(q.explain)}</p>`).join('')}
          <p><button class="btn primary" id="q-done">Back to the water</button> ${score < m.questions.length ? '<button class="btn" id="q-retry">Try again</button>' : ''}</p>`;
        $('#q-done', this.body).onclick = () => this.close();
        if ($('#q-retry', this.body)) $('#q-retry', this.body).onclick = () => { i = 0; score = 0; answers.length = 0; step(); };
        onDone?.();
        return;
      }
      const q = m.questions[i];
      this.body.innerHTML = `<h2>${esc(m.title)}</h2><p style="color:var(--muted)">Question ${i + 1} of ${m.questions.length}</p>
        <div class="q"><p><b>${esc(q.q)}</b></p><div class="opts">${q.options.map((o, k) => `<button data-k="${k}">${esc(o)}</button>`).join('')}</div><div class="explain"></div></div>`;
      const btns = this.body.querySelectorAll('.opts button');
      btns.forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        answers[i] = k;
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

  // ---------------------------------------------------------------- ecosystem lab (generic; each ecosystem supplies eco.lab)
  lab(eco, game) {
    const L = eco.lab;
    this.labState ??= {};
    const st = this.labState[eco.id] ??= { inputs: { ...L.defaults, years: 5 }, series: null, idx: 0 };
    const inp = st.inputs;
    const sliders = [...L.sliders, { id: 'years', label: 'Years to fast-forward', min: 1, max: 10, step: 1, fmt: v => `${v}` }];
    const html = `
      <h2>${esc(L.title)}</h2>
      <p>${esc(L.intro)}</p>
      <div class="lab-grid">
        <div>
          ${sliders.map(sl => `<div class="slider"><label for="s-${sl.id}">${esc(sl.label)} <b id="v-${sl.id}"></b></label><input id="s-${sl.id}" type="range" min="${sl.min}" max="${sl.max}" step="${sl.step}">${sl.help ? `<small>${esc(sl.help)}</small>` : ''}</div>`).join('')}
          ${(L.toggles ?? []).map(t => `<label style="font-size:14px;display:block;margin:6px 0"><input type="checkbox" id="t-${t.id}"> ${esc(t.label)}</label>`).join('')}
          <p><button class="btn primary" id="lab-run">▶ Run time-lapse</button> <button class="btn" id="lab-look">Look at the reef</button> <button class="btn ghost" id="lab-reset">Reset</button></p>
          <p style="font-size:13px;color:var(--muted)">${esc(L.note ?? 'A simplified teaching model: it shows the direction of change, not a forecast.')}</p>
        </div>
        <div>
          <canvas class="chart" id="lab-chart" width="640" height="320" role="img" aria-label="Line chart of the simulation results"></canvas>
          <div class="readout">${L.readouts.map(r => `<div><b id="r-${r.key}">–</b>${esc(r.label)}</div>`).join('')}<div><b id="r-time">Year 0</b>elapsed</div></div>
          <div class="explain-box" id="lab-explain"></div>
          <details style="margin-top:8px;font-size:13px"><summary>Data table</summary><div id="lab-table"></div></details>
        </div>
      </div>`;
    this.open(html, () => { this.labGen = (this.labGen ?? 0) + 1; });
    const sync = () => {
      for (const sl of sliders) { inp[sl.id] = +$(`#s-${sl.id}`).value; $(`#v-${sl.id}`).textContent = sl.fmt(inp[sl.id]); }
      for (const t of L.toggles ?? []) inp[t.id] = $(`#t-${t.id}`).checked;
      $('#lab-explain').textContent = L.explain(inp);
    };
    for (const sl of sliders) { $(`#s-${sl.id}`).value = inp[sl.id]; $(`#s-${sl.id}`).oninput = sync; }
    for (const t of L.toggles ?? []) { $(`#t-${t.id}`).checked = !!inp[t.id]; $(`#t-${t.id}`).onchange = sync; }
    sync();
    const chart = $('#lab-chart');
    const draw = (series, upto) => {
      const g = chart.getContext('2d'), W = chart.width, H = chart.height, x0 = 56, y0 = H - 40, x1 = W - 12, yTop = 66;
      g.clearRect(0, 0, W, H);
      g.font = '18px system-ui'; g.lineWidth = 1;
      for (let y = 0; y <= 100; y += 25) { const py = y0 - (y / 100) * (y0 - yTop); g.strokeStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(x0, py); g.lineTo(x1, py); g.stroke(); g.fillStyle = 'rgba(200,230,240,0.75)'; g.fillText(`${y}%`, 4, py + 6); }
      const n = Math.max(1, series.length - 1), years = n / 12;
      g.fillStyle = 'rgba(200,230,240,0.75)';
      for (let yr = 0; yr <= years; yr++) { const px = x0 + (yr * 12 / n) * (x1 - x0); g.fillText(`${yr}`, px - 5, H - 14); }
      g.fillText('years', x1 - 50, H - 14);
      L.lines.forEach((ln, li) => {
        g.strokeStyle = ln.color; g.lineWidth = 4; g.setLineDash(ln.dashed ? [10, 8] : []);
        g.beginPath();
        for (let i = 0; i <= upto; i++) { const px = x0 + (i / n) * (x1 - x0), py = y0 - Math.min(1, series[i][ln.key]) * (y0 - yTop); i ? g.lineTo(px, py) : g.moveTo(px, py); }
        g.stroke(); g.setLineDash([]);
        g.fillStyle = ln.color; g.fillText((ln.dashed ? '- - ' : '— ') + ln.label, 10 + (li % 2) * 300, 18 + Math.floor(li / 2) * 20);
      });
    };
    const show = (series, i) => {
      const s = series[i];
      for (const r of L.readouts) $(`#r-${r.key}`).textContent = r.fmt(s[r.key]);
      $('#r-time').textContent = `Year ${(i / 12).toFixed(1)}`;
      draw(series, i);
      $('#lab-table').innerHTML = `<table style="width:100%;border-collapse:collapse">${'<tr><th>Year</th>' + L.lines.map(l => `<th>${esc(l.label)}</th>`).join('') + '</tr>'}${series.filter((_, k) => k % 12 === 0 && k <= i).map((r, k) => `<tr><td>${k}</td>${L.lines.map(l => `<td>${Math.round(r[l.key] * 100)}</td>`).join('')}</tr>`).join('')}</table>`;
    };
    if (st.series) show(st.series, st.idx); else { st.series = L.simulate(inp, 0); st.idx = 0; show(st.series, 0); }
    $('#lab-run').onclick = () => {
      sync();
      const gen = this.labGen = (this.labGen ?? 0) + 1; // a new run cancels any previous one
      const series = st.series = L.simulate(inp, inp.years);
      const runInputs = { ...inp };
      const t0 = performance.now(), dur = 1200 + inp.years * 900;
      const tick = () => {
        if (gen !== this.labGen) return;
        const f = Math.min(1, (performance.now() - t0) / dur);
        const i = st.idx = Math.round(f * (series.length - 1));
        show(series, i);
        L.apply(game, series[i]);
        if (f < 1) requestAnimationFrame(tick);
        else {
          const max = {}; for (const k of Object.keys(series[0])) max[k] = Math.max(...series.map(r => r[k]));
          const result = { inputs: runInputs, final: series[i], max, years: runInputs.years };
          game.onLabResult(result);
        }
      };
      tick();
    };
    $('#lab-look').onclick = () => this.close();
    $('#lab-reset').onclick = () => { this.labGen = (this.labGen ?? 0) + 1; st.series = L.simulate(inp, 0); st.idx = 0; L.apply(game, st.series[0]); show(st.series, 0); };
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
