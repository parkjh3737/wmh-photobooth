// 캔버스 그리기 도구와 로고. 프레임(frames.js)이 이 함수들을 조합해 쓴다.
import { S } from './config.js';

/* ───────── 그리기 도구 ───────── */
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export function drawCover(ctx, src, c) {
  const sw = src.width, sh = src.height, ar = c.w / c.h; let cw = sw, ch = sw / ar; if (ch > sh) { ch = sh; cw = sh * ar; }
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, c.x, c.y, c.w, c.h);
}
/* 글자 사이를 ls 만큼 벌려 왼쪽 정렬로 쓰기. 쓴 너비를 돌려준다 */
export function spacedLeft(ctx, text, x, y, ls) {
  ctx.save(); ctx.textAlign = 'left'; let cx = x; for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + ls; } ctx.restore(); return cx - ls - x;
}
/* 종이 알갱이. rgb 색의 점을 density 비율로, 투명도 0~aMax(0~255)로 뿌린다. scale 을 키우면 알갱이가 굵어진다 */
export function grain(ctx, W, H, seed, rgb, aMax, density, scale = 1) {
  const n = mk(256, 256), nx = n.getContext('2d'), d = nx.createImageData(256, 256), r = rng(seed), [R, G, B] = rgb.split(',').map(Number);
  for (let i = 0; i < d.data.length; i += 4) if (r() < density) { d.data[i] = R; d.data[i + 1] = G; d.data[i + 2] = B; d.data[i + 3] = r() * aMax | 0; }
  nx.putImageData(d, 0, 0); ctx.save(); ctx.scale(scale, scale); ctx.fillStyle = ctx.createPattern(n, 'repeat'); ctx.fillRect(0, 0, W / scale + 1, H / scale + 1); ctx.restore();
}
/* 가운데 정렬로 글자 사이를 벌려 쓰기 */
export function spaced(ctx, text, cx, y, ls) {
  const ch = [...text], ws = ch.map(c => ctx.measureText(c).width);
  let x = cx - (ws.reduce((a, b) => a + b, 0) + ls * (ch.length - 1)) / 2;
  ctx.save(); ctx.textAlign = 'left'; ch.forEach((c, i) => { ctx.fillText(c, x, y); x += ws[i] + ls; }); ctx.restore();
}
export const FONT_EN = 'Jost, Futura, "Avenir Next", sans-serif';
export const FONT_HAND = '"WMH Hand", "Nothing You Could Do", cursive';      // 흘려 쓴 손글씨
export const FONT_MARKER = '"WMH Marker", "Reenie Beanie", cursive';   // 마커로 쓴 숫자·큰 글씨
export const FONT_SCRIPT = '"WMH Script", "Sacramento", cursive';     // 가는 선의 필기체 (이야기 프레임 제목)
export const FONT_BRUSH = '"WMH Brush", "Mr Dafoe", cursive';        // 붓글씨 (추억 프레임의 세로 글씨)
export const FONT_BUBBLE = '"WMH Bubble", "Londrina Sketch", sans-serif';  // 손으로 그린 테두리 글씨 (낙서 프레임)
export const FONT_SANS = '"WMH Sans", "Noto Sans KR", sans-serif';   // 한글 고딕 (추억 프레임 본문)
export const FONT_MIX = 'Jost, "WMH Serif", "Noto Serif KR", AppleMyungjo, serif';

/* 로고: 인스타그램 프로필의 원본(가는 선의 띠 + 두 줄 글자)을 비율 그대로 벡터로 옮긴 것 */
export let logoMask = null, logoRaw = null;
export function drawLogo(ctx, cx, cy, w, col, dim) {
  const k = w / 563, h = 294 * k, x = cx - w / 2, y = cy - h / 2;
  if (logoRaw && !S.logoLine) {
    const src = (S.logoTint && logoMask) ? tinted(col) : logoRaw, bw = w, bh = h * 1.12;
    const s = Math.min(bw / src.width, bh / src.height), dw = src.width * s, dh = src.height * s;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, cx - dw / 2, cy - dh / 2, dw, dh); ctx.restore(); return;
  }
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.6, 4.2 * k); ctx.lineJoin = 'miter'; ctx.miterLimit = 8;
  ctx.beginPath(); [[0, 0], [563, 0], [458, 147], [563, 294], [0, 294], [105, 147]].forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](x + p[0] * k, y + p[1] * k)); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = col; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = '700 100px ' + FONT_EN; const fs = 100 * (400 * k) / ctx.measureText('welcomemistakes').width;
  ctx.font = `700 ${fs}px ${FONT_EN}`; ctx.fillText('welcomemistakes', cx, y + 84 * k);
  ctx.fillStyle = dim; ctx.font = `300 ${32 * k}px ${FONT_EN}`;
  const t = 'guesthouse', nat = [...t].reduce((a, c) => a + ctx.measureText(c).width, 0);
  spaced(ctx, t, cx, y + 230 * k, (245 * k - nat) / (t.length - 1));
  ctx.restore();
}
export function tinted(col) {
  const c = mk(logoMask.width, logoMask.height), x = c.getContext('2d');
  x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'destination-in'; x.drawImage(logoMask, 0, 0); return c;
}
export function loadLogo(dataUrl) {
  return new Promise(res => {
    if (!dataUrl) { logoRaw = logoMask = null; return res(); }
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, 1400 / Math.max(im.width, im.height)), c = mk(Math.round(im.width * s), Math.round(im.height * s)), x = c.getContext('2d');
      x.drawImage(im, 0, 0, c.width, c.height); logoRaw = c;
      // 투명 배경이면 알파를, 아니면 배경 대비 밝기 차이를 마스크로 사용
      const m = mk(c.width, c.height), mx = m.getContext('2d'); mx.drawImage(c, 0, 0);
      const d = mx.getImageData(0, 0, m.width, m.height), p = d.data; let hasAlpha = false;
      for (let i = 3; i < p.length; i += 4 * 97) if (p[i] < 250) { hasAlpha = true; break; }
      if (!hasAlpha) { const bg = (p[0] * .299 + p[1] * .587 + p[2] * .114) > 128; for (let i = 0; i < p.length; i += 4) { const l = p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114; p[i + 3] = bg ? 255 - l : l; } }
      for (let i = 0; i < p.length; i += 4) { p[i] = p[i + 1] = p[i + 2] = 255; }
      mx.putImageData(d, 0, 0); logoMask = m; res();
    };
    im.onerror = () => { logoRaw = logoMask = null; res(); };
    im.src = dataUrl;
  });
}

export function fibers(ctx, W, H, seed, n, cols) {
  const r = rng(seed); ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 8 + r() * 46;
    ctx.strokeStyle = cols[i % cols.length]; ctx.globalAlpha = .05 + r() * .1; ctx.lineWidth = .8 + r() * 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * .5 + (r() - .5) * 12, y + Math.sin(a) * l * .5 + (r() - .5) * 12, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  ctx.restore();
}
