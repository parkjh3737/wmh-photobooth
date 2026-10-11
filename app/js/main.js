// 화면 흐름: 첫 화면 → 프레임 → 촬영 → 고르기 → 인쇄. 카메라·인쇄·호스트 설정도 여기 있다.
import { DEF, S, persist, LAYOUTS, HERO_FOCUS, LOGO_FILE } from './config.js';
import { mk, loadLogo, tinted, logoRaw, logoMask } from './draw.js';
import { FRAMES, FILTERS, compose, demoShots, drawHeroFallback, needOf, aspectFor } from './frames.js';
import { LANGS, DEF_LANG, lang, t, setLang } from './i18n.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DEMO_URL = /[?&#]demo/.test(location.search + location.hash); let DEMO = DEMO_URL;   // 주소 끝에 ?demo 를 붙이면 카메라 없이 견본 사진으로 동작
const save = () => { if (!persist()) toast('설정을 저장하지 못했습니다. 로고 파일이 너무 클 수 있습니다.'); };

/* ───────── 화면 전환 ───────── */
const state = { screen: 'idle', shots: [], picked: [], running: false, takes: 5, need: 3 };   // takes: 찍을 컷 수, need: 프레임에 들어갈 컷 수
let stream = null, idleTimer = null, wake = null, printing = false;
const today = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())}`; };
function show(id) {
  state.screen = id; $$('.screen').forEach(s => s.hidden = s.id !== 's-' + id);
  if (id !== 'shoot') { state.running = false; stopCam(); }
  armIdle();
}
function armIdle() {
  clearTimeout(idleTimer);
  if (state.screen === 'idle' || state.running || !$('#settings').hidden) return;
  idleTimer = setTimeout(() => { if (printing) return armIdle(); if (!state.running) { goIdle(); changeLang(DEF_LANG); } }, Math.max(30, +S.idleSec || 120) * 1000);
}
addEventListener('beforeprint', () => { printing = true; clearTimeout(idleTimer); });
addEventListener('afterprint', () => { printing = false; armIdle(); });
function goIdle() { DEMO = DEMO_URL; state.shots = []; state.picked = []; $('#printImg').removeAttribute('src'); show('idle'); }
let toastT; function toast(msg, ms = 3200) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, ms); }
addEventListener('pointerdown', () => { armIdle(); unlockAudio(); }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) goIdle(); });
document.addEventListener('contextmenu', e => e.preventDefault());
async function keepAwake() { try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); else if (state.screen === 'shoot') { state.running = false; show('pick'); } });

/* ───────── 소리 ───────── */
let actx = null;
function unlockAudio() { if (!S.sound) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
function beep(freq, dur, vol = .12) {
  if (!S.sound || !actx) return; const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
  o.frequency.value = freq; o.type = 'sine'; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur);
}
function shutter() {
  if (!S.sound || !actx) return; const n = actx.sampleRate * .09, b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const s = actx.createBufferSource(), g = actx.createGain(); s.buffer = b; g.gain.value = .35; s.connect(g).connect(actx.destination); s.start();
}

/* ───────── 2. 프레임 고르기 ───────── */
const cur = { frame: S.frame, filter: S.filter };
const previewOpts = (frame, shots, filter) => ({ frame, shots, filter: filter || 'none', safe: 0, date: S.showDate ? today() : '', today: today(), caption: S.caption });
/* 프레임은 한 장씩 넘겨 본다(옆으로 밀기·화살표·점). 화면에 보이는 프레임이 고른 프레임이다 */
const frameKeys = () => Object.keys(FRAMES);
const previews = { day: '', map: {} };   // 견본 미리보기는 그리기가 무거워 하루 동안 다시 쓴다(설정을 저장하면 다시 그림)
function previewOf(k) {
  if (previews.day !== today()) { previews.day = today(); previews.map = {}; }
  if (!previews.map[k]) { const tmp = mk(1200, 1800), c = mk(600, 900); compose(tmp, previewOpts(k, demoShots(4))); c.getContext('2d').drawImage(tmp, 0, 0, 600, 900); previews.map[k] = c; }
  return previews.map[k];
}
function renderFrameGrid() {
  const view = $('#frameGrid'), dots = $('#frameDots'), keys = frameKeys(), track = document.createElement('div'); track.className = 'frames-track'; track.id = 'frameTrack';
  view.innerHTML = ''; dots.innerHTML = ''; view.append(track);
  keys.forEach((k, i) => {
    const sl = document.createElement('div'); sl.className = 'frame'; sl.dataset.frame = k; sl.setAttribute('role', 'group'); sl.setAttribute('aria-roledescription', 'slide'); sl.setAttribute('aria-label', `${i + 1} / ${keys.length}`);
    const s = document.createElement('span'); s.innerHTML = `${t('frame.' + k)}<small>${FRAMES[k].en}</small><em>${t('cuts', FRAMES[k].need)}</em>`;
    sl.append(previewOf(k), s); track.append(sl);
    const d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', t('frame.' + k)); d.onclick = () => goFrame(i); dots.append(d);
  });
  goFrame(keys.indexOf(cur.frame), false);
}
/* 슬라이드는 스크롤이 아니라 띠(track)를 옆으로 옮겨 보여 준다. 스크롤+snap 은 기기마다 코드로 옮길 때 움직이지 않는 경우가 있었다 */
let carI = 0;
function goFrame(i, smooth = true) {
  const n = frameKeys().length, tr = $('#frameTrack'); carI = (i + n) % n; cur.frame = frameKeys()[carI]; paintFrameDots();
  if (!tr) return; tr.classList.toggle('drag', !smooth); tr.style.transform = `translateX(${-carI * 100}%)`;
  $$('#frameTrack .frame').forEach((f, j) => f.setAttribute('aria-hidden', j !== carI));
}
function paintFrameDots() { const i = frameKeys().indexOf(cur.frame); $$('#frameDots button').forEach((d, j) => d.setAttribute('aria-current', j === i)); }
$('#btnFramePrev').onclick = () => goFrame(carI - 1);
$('#btnFrameNext').onclick = () => goFrame(carI + 1);
/* 손가락(또는 마우스)으로 옆으로 밀기: 너비의 18% 넘게 밀거나 빠르게 튕기면 한 장 넘어간다. 양 끝에서는 덜 끌려가고 넘어가지 않는다 */
let drag = null;
const view = $('#frameGrid');
view.addEventListener('pointerdown', e => { if (e.button > 0) return; drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, dx: 0, on: false }; });
view.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y, n = frameKeys().length;
  if (!drag.on) { if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return; drag.on = true; try { view.setPointerCapture(e.pointerId); } catch (err) {} $('#frameTrack').classList.add('drag'); }
  const edge = (carI === 0 && dx > 0) || (carI === n - 1 && dx < 0); drag.dx = edge ? dx * .35 : dx;
  $('#frameTrack').style.transform = `translateX(calc(${-carI * 100}% + ${drag.dx}px))`;
});
const endDrag = e => {
  if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; if (!d.on) return;
  const n = frameKeys().length, fast = Math.abs(d.dx) / Math.max(1, performance.now() - d.t) > .45 && Math.abs(d.dx) > 30;
  const step = (Math.abs(d.dx) > view.clientWidth * .18 || fast) ? (d.dx < 0 ? 1 : -1) : 0;
  goFrame(Math.max(0, Math.min(n - 1, carI + step)));
};
view.addEventListener('pointerup', endDrag); view.addEventListener('pointercancel', endDrag);
/* ───────── 1. 첫 화면: 스테이 사진 + 인사말 ───────── */
const hero = { list: [], at: -1, timer: null, layer: 0 };
const probe = u => new Promise(r => { const im = new Image(); im.onload = () => r(true); im.onerror = () => r(false); im.src = u; });
/* app/photos/ 에 1.jpg, 2.jpg … 순서로 넣은 사진을 찾는다 (jpg·jpeg·png·webp, 번호가 끊기면 멈춤) */
async function findPhotos() {
  const out = [];
  for (let i = 1; i <= 8; i++) { let hit = null; for (const ext of ['jpg', 'jpeg', 'png', 'webp']) { if (await probe(`photos/${i}.${ext}`)) { hit = `photos/${i}.${ext}`; break; } } if (!hit) break; out.push(hit); }
  return out;
}
function heroNext() {
  if (!hero.list.length) return;
  hero.at = (hero.at + 1) % hero.list.length; hero.layer ^= 1;
  const on = $(hero.layer ? '#heroB' : '#heroA'), off = $(hero.layer ? '#heroA' : '#heroB');
  on.style.objectPosition = HERO_FOCUS[hero.at] || '50% 50%';
  on.onload = () => { on.classList.add('on'); off.classList.remove('on'); }; on.src = hero.list[hero.at];
}
function heroPlay() { clearInterval(hero.timer); if (hero.list.length > 1) hero.timer = setInterval(() => { if (state.screen === 'idle' && document.visibilityState === 'visible') heroNext(); }, 9000); }
function renderIdle() {
  const fb = $('#heroFallback');
  if (hero.list.length) fb.hidden = true;
  else { fb.hidden = false; fb.width = Math.round(innerWidth * Math.min(2, devicePixelRatio || 1)); fb.height = Math.round(innerHeight * Math.min(2, devicePixelRatio || 1)); drawHeroFallback(fb); }
  const ko = lang === 'ko';   // 한국어 인사말은 호스트 설정을 따르고, 다른 언어는 번역을 쓴다
  $('#greetTitle').textContent = ko ? S.greetTitle : t('greetTitle'); $('#greetSub').textContent = ko ? S.greetSub : t('greetSub'); $('#greetEn').textContent = ko ? S.greetEn : t('eyebrow');
  const hold = $('#logoHold'), old = hold.querySelector('img'); if (old) old.remove();
  const useImg = logoRaw && !S.logoLine;
  $('#logoSvg').style.display = useImg ? 'none' : '';
  if (useImg) { const im = new Image(); im.alt = ''; im.src = ((S.logoTint && logoMask) ? tinted('#f1ece1') : logoRaw).toDataURL(); hold.append(im); }
}
addEventListener('resize', () => { if (!hero.list.length && state.screen === 'idle') renderIdle(); });
/* 언어 고르기 (첫 화면 오른쪽 위) */
const langBtn = $('#btnLang'), langList = $('#langList');
function changeLang(l) { setLang(l); $('#langNow').textContent = LANGS[lang]; $$('#langList button').forEach(b => b.setAttribute('aria-checked', b.dataset.lang === lang)); renderIdle(); }
function toggleLangList(open) { langList.hidden = !open; langBtn.setAttribute('aria-expanded', open); }
Object.entries(LANGS).forEach(([k, name]) => {
  const b = document.createElement('button'); b.type = 'button'; b.lang = k; b.dataset.lang = k; b.textContent = name; b.setAttribute('role', 'menuitemradio'); b.setAttribute('aria-checked', k === lang);
  b.onclick = () => { changeLang(k); toggleLangList(false); }; langList.append(b);
});
langBtn.onclick = () => toggleLangList(langList.hidden);
document.addEventListener('pointerdown', e => { if (!langList.hidden && !e.target.closest('.lang')) toggleLangList(false); });
$('#btnStart').onclick = () => { keepAwake(); cur.frame = FRAMES[S.frame] ? S.frame : DEF.frame; cur.filter = S.filter; state.shots = []; state.picked = []; renderFrameGrid(); show('pick'); };
$('#btnToShoot').onclick = () => enterShoot();

/* ───────── 3. 촬영 ───────── */
const video = $('#video');
function stopCam() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } video.srcObject = null; }
async function startCam() {
  stopCam();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error('insecure'), { name: 'Insecure' });
  const base = { width: { ideal: 1920 }, height: { ideal: 1440 }, aspectRatio: { ideal: 4 / 3 } };   // 전면 센서(4:3)를 다 써서 화각을 넓게
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: S.deviceId ? Object.assign({ deviceId: { exact: S.deviceId } }, base) : Object.assign({ facingMode: 'user' }, base) }); }
  catch (e) { if (S.deviceId) { S.deviceId = ''; save(); return startCam(); } throw e; }
  video.srcObject = stream; video.classList.toggle('mirror', !!S.mirror); await video.play();
}
function grab() {   // 인쇄에 충분한 크기(긴 변 1600px)로 줄여 보관 — 4GB 램 태블릿에서 8컷까지 여유
  const vw = video.videoWidth, vh = video.videoHeight, s = Math.min(1, 1600 / Math.max(vw, vh)), w = Math.round(vw * s), h = Math.round(vh * s), c = mk(w, h), x = c.getContext('2d');
  if (S.mirror) { x.translate(w, 0); x.scale(-1, 1); } x.drawImage(video, 0, 0, w, h); return c;
}
function paintDots() {
  const d = $('#dots'); d.innerHTML = '';
  for (let i = 0; i < state.takes; i++) { const el = document.createElement('i'); if (state.shots[i]) el.style.backgroundImage = `url(${thumb(state.shots[i])})`; if (i === state.shots.length && state.running) el.className = 'now'; d.append(el); }
  $('#shotNow').textContent = state.shots.length; $('#shotAll').textContent = state.takes;
}
function thumb(src) { if (src._t) return src._t; const s = 320 / src.width, c = mk(320, Math.round(src.height * s)); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return (src._t = c.toDataURL('image/jpeg', .8)); }
async function enterShoot() {
  state.shots = []; state.picked = []; state.running = false;
  state.need = needOf(cur.frame); state.takes = state.need + Math.max(0, +S.extra || 0);   // 프레임에 들어갈 수보다 몇 컷 더 찍어 고르게 한다
  $('#finder').style.setProperty('--ar', aspectFor(cur.frame).toFixed(4));
  $('#still').hidden = true; $('#count').textContent = ''; $('#camMsg').hidden = true;
  $('#shootTitle').textContent = t('ready'); $('#btnShoot').hidden = false; $('#btnShoot').disabled = true;
  paintDots(); show('shoot');
  if (DEMO) { $('#btnShoot').disabled = false; return; }
  try { await startCam(); $('#btnShoot').disabled = false; }
  catch (e) {
    const m = $('#camMsg'); m.hidden = false;
    const why = t(e.name === 'NotAllowedError' ? 'camDenied' : e.name === 'Insecure' ? 'camInsecure' : e.name === 'NotFoundError' ? 'camNone' : 'camFail');
    m.innerHTML = ''; const w = document.createElement('div'); w.textContent = why; m.append(w); const b = document.createElement('button'); b.className = 'btn'; b.innerHTML = `<span>${t('retry')}</span><small>Retry</small>`; b.onclick = enterShoot; m.append(b);
    const d = document.createElement('button'); d.className = 'btn ghost'; d.textContent = t('demoFlow'); d.onclick = () => { DEMO = true; enterShoot(); }; m.append(d);
  }
}
async function countdown(n) {
  const el = $('#count');
  for (let i = n; i > 0; i--) { if (!state.running) return false; el.textContent = i; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); beep(i === 1 ? 990 : 660, .14); await sleep(DEMO ? 120 : 1000); }
  el.textContent = ''; return state.running;
}
async function runSequence() {
  state.running = true; clearTimeout(idleTimer); $('#btnShoot').hidden = true;
  const still = $('#still'), demo = DEMO ? demoShots(state.takes) : null;
  while (state.shots.length < state.takes) {
    $('#shootTitle').textContent = t('shotN', state.shots.length + 1); $('#still').hidden = true; paintDots();
    if (!await countdown(+S.countdown || 5)) return;
    const shot = DEMO ? demo[state.shots.length] : grab(); state.shots.push(shot);
    $('#flash').classList.remove('go'); void $('#flash').offsetWidth; $('#flash').classList.add('go'); shutter();
    still.width = shot.width; still.height = shot.height; still.getContext('2d').drawImage(shot, 0, 0); still.hidden = false; paintDots();
    await sleep(DEMO ? 100 : 1100); if (!state.running) return;
  }
  state.running = false; stopCam();
  if (state.takes > state.need) enterSelect(); else { state.picked = state.shots.map((_, i) => i); enterResult(); }
}
$('#btnShoot').onclick = runSequence;
$('#btnCancelShoot').onclick = () => { state.running = false; show('pick'); };

/* ───────── 4. 고르기 ───────── */
function enterSelect() {
  state.picked = []; const g = $('#shotGrid'); g.innerHTML = ''; g.style.gridTemplateColumns = `repeat(${state.shots.length > 6 ? 4 : 3},minmax(0,1fr))`;
  state.shots.forEach((s, i) => {
    const b = document.createElement('button'); b.className = 'shot'; b.style.backgroundImage = `url(${thumb(s)})`; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', `${i + 1}`);
    const em = document.createElement('em'); b.append(em);
    b.onclick = () => { const at = state.picked.indexOf(i); if (at >= 0) state.picked.splice(at, 1); else if (state.need === 1) state.picked = [i]; else if (state.picked.length < state.need) state.picked.push(i); else return toast(t('pickFull')); paintPicked(); };
    g.append(b);
  });
  $('#pickAll').textContent = state.need; $('#pickTitle').textContent = state.need === 1 ? t('pick1') : t('pickN', state.need);
  $('#pickTip').textContent = t(state.need === 1 ? 'tip1' : 'tipN');
  paintPicked(); show('select');
}
function paintPicked() {
  $$('#shotGrid .shot').forEach((b, i) => { const at = state.picked.indexOf(i); b.setAttribute('aria-pressed', at >= 0); b.firstChild.textContent = at >= 0 ? at + 1 : ''; });
  $('#pickNow').textContent = state.picked.length; $('#btnToResult').disabled = state.picked.length !== state.need;
}
$('#btnToResult').onclick = () => enterResult();
$('#btnReshoot1').onclick = $('#btnReshoot2').onclick = () => enterShoot();

/* ───────── 5. 결과 · 인쇄 ───────── */
function chips(el, items, key, after) {
  el.innerHTML = ''; Object.keys(items).forEach(k => {
    const b = document.createElement('button'); b.innerHTML = `${t(key + '.' + k)}<small>${items[k].en}</small>`; b.setAttribute('aria-pressed', cur[key] === k);
    b.onclick = () => { cur[key] = k; [...el.children].forEach(c => c.setAttribute('aria-pressed', c === b)); if (after) after(); renderOut(); }; el.append(b);
  });
}
const outOpts = safe => ({ frame: cur.frame, filter: cur.filter, shots: state.picked.map(i => state.shots[i]), safe, date: S.showDate ? today() : '', today: today(), caption: S.caption });
function renderOut() {
  compose($('#out'), outOpts(0));
}
function enterResult() {
  // 고른 사진 수로 채울 수 있는 프레임만 보여 준다 (한 장만 골랐으면 우표만)
  const usable = Object.fromEntries(Object.entries(FRAMES).filter(([k]) => needOf(k) <= state.picked.length));
  chips($('#chipFrame'), usable, 'frame'); chips($('#chipFilter'), FILTERS, 'filter'); renderOut(); show('result');
}
async function printCanvas(cv) {
  const img = $('#printImg'); img.src = cv.toDataURL('image/jpeg', .95);
  try { await img.decode(); } catch (e) {}
  if (typeof window.print !== 'function') return toast(t('noPrint', t('save')), 6000);
  window.print();
}
$('#btnPrint').onclick = () => { const c = mk(1200, 1800); compose(c, outOpts(+S.safe || 0)); printCanvas(c); };
$('#btnShare').onclick = async () => {
  const c = mk(1200, 1800); compose(c, outOpts(0));
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .95)), name = `welcomemistakes-${today().replace(/\./g, '')}-${Date.now() % 100000}.jpg`;
  const file = new File([blob], name, { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); } catch (e) {} }
  else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(t('saved')); }
};

/* ───────── 호스트 설정 ───────── */
let holdT = null;
const hold = $('#logoHold');
hold.addEventListener('pointerdown', () => { holdT = setTimeout(openSettings, 2000); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hold.addEventListener(ev, () => clearTimeout(holdT)));
async function openSettings() {
  $('#setExtra').value = String(S.extra); $('#setCount').value = S.countdown; $('#setIdle').value = S.idleSec; $('#setCaption').value = S.caption; $('#setGreet').value = S.greetTitle; $('#setGreetSub').value = S.greetSub; $('#setGreetEn').value = S.greetEn; $('#setSafe').value = S.safe;
  $('#setMirror').checked = !!S.mirror; $('#setDate').checked = !!S.showDate; $('#setSound').checked = !!S.sound; $('#setTint').checked = !!S.logoTint; $('#setLine').checked = !!S.logoLine;
  $('#logoState').textContent = S.logo ? '이 태블릿에 올린 로고 파일을 쓰고 있습니다.' : '공식 사이트 로고(app/logo/logo.png)를 쓰고 있습니다.';
  const sel = $('#setCamera'); sel.length = 1;
  try { (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput').forEach((d, i) => { const o = new Option(d.label || `카메라 ${i + 1}`, d.deviceId); sel.add(o); }); } catch (e) {}
  sel.value = S.deviceId || ''; $('#settings').hidden = false; clearTimeout(idleTimer);
}
$('#btnCloseSet').onclick = () => { $('#settings').hidden = true; };
$('#btnSaveSet').onclick = () => {
  const num = (id, lo, hi, d) => { const v = parseFloat($(id).value); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  Object.assign(S, { extra: +$('#setExtra').value, countdown: Math.round(num('#setCount', 2, 10, 5)), idleSec: Math.round(num('#setIdle', 30, 900, 120)), caption: $('#setCaption').value.trim(), greetTitle: $('#setGreet').value.trim() || DEF.greetTitle, greetSub: $('#setGreetSub').value.trim(), greetEn: $('#setGreetEn').value.trim(), safe: num('#setSafe', 0, 6, 2),
    mirror: $('#setMirror').checked, showDate: $('#setDate').checked, sound: $('#setSound').checked, logoTint: $('#setTint').checked, logoLine: $('#setLine').checked, deviceId: $('#setCamera').value, frame: cur.frame });
  save(); previews.map = {}; renderIdle(); $('#settings').hidden = true; toast('저장했습니다.');
};
$('#setLogo').onchange = e => {
  const f = e.target.files[0]; if (!f) return; const fr = new FileReader();
  fr.onload = async () => { await loadLogo(fr.result); S.logo = logoRaw ? logoRaw.toDataURL('image/png') : null; if (!S.logo) await loadLogo(LOGO_FILE); save(); previews.map = {}; renderIdle(); $('#logoState').textContent = S.logo ? '올린 로고 파일을 쓰고 있습니다.' : '이 파일은 읽지 못했습니다.'; };
  fr.readAsDataURL(f);
};
$('#btnLogoReset').onclick = async () => { S.logo = null; await loadLogo(LOGO_FILE); save(); previews.map = {}; renderIdle(); $('#setLogo').value = ''; $('#logoState').textContent = '공식 사이트 로고(app/logo/logo.png)를 쓰고 있습니다.'; };
$('#btnFull').onclick = () => { const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || (() => toast('이 기기는 "홈 화면에 추가"로 전체 화면을 씁니다.'))).call(d); };
$('#btnTestPrint').onclick = () => { const c = mk(1200, 1800); compose(c, { frame: cur.frame, filter: 'none', shots: demoShots(4), safe: parseFloat($('#setSafe').value) || 0, date: today(), today: today(), caption: $('#setCaption').value.trim() }); printCanvas(c); };

/* ───────── 안드로이드 태블릿: 뒤로가기로 앱이 닫히지 않게 ───────── */
history.pushState({ wmh: 1 }, '');
addEventListener('popstate', () => { history.pushState({ wmh: 1 }, ''); if (!$('#settings').hidden) $('#settings').hidden = true; else if (state.screen !== 'idle') goIdle(); });

/* ───────── 시작 ───────── */
(async () => {
  try { await Promise.all([document.fonts.load('700 40px Jost'), document.fonts.load('300 40px Jost'), document.fonts.load('400 40px Jost'), document.fonts.load('500 40px "WMH Serif"', '환영'), document.fonts.load('40px "WMH Hand"'), document.fonts.load('40px "WMH Marker"'),
    document.fonts.load('40px "WMH Script"'), document.fonts.load('40px "WMH Bubble"'), document.fonts.load('40px "WMH Brush"'), document.fonts.load('25px "WMH Sans"', '추억')]); } catch (e) {}
  await loadLogo(S.logo || LOGO_FILE); hero.list = await findPhotos(); changeLang(DEF_LANG); heroNext(); heroPlay(); show('idle');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__wmh = { compose, demoShots, FRAMES, LAYOUTS, state, cur, hero };   // 테스트·디버깅용
})();

